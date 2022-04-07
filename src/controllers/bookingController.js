const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const ParkingBooking = require("../models/parkingBookingModal");

const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");

// New booking
const createBooking = async (req, res) => {
  try {
    const bookingId = new mongoose.Types.ObjectId();
    const parkingBooking = await ParkingBooking.findOne({
      parking: req.body.parking,
      slot: req.body.slot,
    }).populate("bookings");
    if (!parkingBooking) {
      throw new Error("parking or slot is not valid");
    }

    // logic of deleting expired bookings id from parkingBooking
    const currentTime = new Date().getTime();
    const newBookings = parkingBooking.bookings.filter((booking) => {
      const bookedOut = new Date(booking.outTime).getTime();
      return bookedOut >= currentTime;
    });

    // logic of time is occupied or not
    const requestedIn = new Date(req.body.inTime).getTime();
    const requestedOut = new Date(req.body.outTime).getTime();
    const occupied = parkingBooking.bookings.some((booking) => {
      const bookedIn = new Date(booking.inTime).getTime();
      const bookedOut = new Date(booking.outTime).getTime();
      return (
        (bookedIn <= requestedIn && requestedIn < bookedOut) ||
        (bookedIn < requestedOut && requestedOut <= bookedOut)
      );
    });
    if (occupied) {
      return res.status(409).send({
        error: "This time is already booked on this slot.",
      });
    }

    const booking = new Booking({
      _id: bookingId,
      user: req.user._id,
      car: req.user.car,
      ...req.body,
    });
    await booking.save();
    newBookings.push(bookingId);
    parkingBooking.bookings = newBookings;
    await parkingBooking.save();

    res.send(booking);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.user._id,
    });
    if (!booking) {
      throw new Error("Booking not found or you do not have permission.");
    }

    const parkingBooking = await ParkingBooking.findOne({
      parking: booking.parking,
      slot: booking.slot,
    }).populate("bookings");

    // logic of deleting booking and expired bookings id from parkingBooking
    const currentTime = new Date().getTime();
    const newBookigs = parkingBooking.bookings.filter((bkng) => {
      const bookedOut = new Date(bkng.outTime).getTime();
      return bookedOut >= currentTime || bkng._id != booking._id; // != for string and object Id comparision
    });
    parkingBooking.bookings = newBookigs;
    await parkingBooking.save();

    await booking.remove();
    res.send({
      status: "success",
      message: "booking deleted successfully",
      deletedBooking: booking,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

// Get all bookings of user
const userBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .select("-user")
      .sort({ inTime: -1 })
      .populate({
        path: "car",
        select: "carNo",
      })
      .populate({
        path: "parking",
        select: "parkingName",
      });
    const totalResults = await Booking.find({
      user: req.user._id,
    }).count();
    res.send({ bookings, totalResults });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

// Get all bookings of car
const carBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      car: req.params.carId,
    })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .select("-car -user")
      .sort({ inTime: -1 })
      .populate({
        path: "parking",
        select: "parkingName",
      });
    const totalResults = await Booking.find({
      car: req.params.carId,
    }).count();
    res.send({ bookings, totalResults });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

//Get all bookings of parking
const parkingBookings = async (req, res) => {
  try {
    const parkingBookings = await ParkingBooking.find({
      parking: req.params.parkingId,
    })
      .select("-parking")
      .populate({
        path: "bookings",
        match: {
          inTime: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
        select: "inTime outTime",
        options: { sort: { inTime: 1 } },
      });
    if (parkingBookings.length == 0) {
      return res.status(404).send({
        error: "parking not found",
      });
    }

    const data = {};
    parkingBookings.forEach(async (parkingBooking) => {
      // logic of deleting expired bookings id from parkingBooking
      const currentTime = new Date().getTime();
      const newBookings = parkingBooking.bookings.filter((booking) => {
        const bookedOut = new Date(booking.outTime).getTime();
        return bookedOut >= currentTime;
      });

      data[parkingBooking.slot] = newBookings;
      parkingBooking.bookings = newBookings;
      await parkingBooking.save();
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

//Get all bookings of parking slot
const parkingSlotBookings = async (req, res) => {
  try {
    const parkingBooking = await ParkingBooking.findOne({
      parking: req.params.parkingId,
      slot: req.params.slot,
    }).populate({
      path: "bookings",
      options: { sort: { inTime: 1 } },
      populate: {
        path: "user car",
        select: "name carNo -_id",
      },
      select: "-parking -slot -__v",
    });
    if (!parkingBooking)
      return res.status(404).send({
        error: "parking not found or slot not found",
      });

    // logic of deleting expired bookings id from parkingBooking
    const currentTime = new Date().getTime();
    const newBookings = parkingBooking.bookings.filter((booking) => {
      const bookedOut = new Date(booking.outTime).getTime();
      return bookedOut >= currentTime;
    });

    parkingBooking.bookings = newBookings;
    await parkingBooking.save();
    res.send(parkingBooking.bookings);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  deleteBooking,
  userBookings,
  carBookings,
  parkingBookings,
  parkingSlotBookings,
};
