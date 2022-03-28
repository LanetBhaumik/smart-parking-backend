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
      const bookedOut = new Date(booking.out_time).getTime();
      return bookedOut >= currentTime;
    });

    //logic of time is occupied or not
    const requestedIn = new Date(req.body.in_time).getTime();
    const requestedOut = new Date(req.body.out_time).getTime();
    const occupied = parkingBooking.bookings.some((booking) => {
      const bookedIn = new Date(booking.in_time).getTime();
      const bookedOut = new Date(booking.out_time).getTime();
      return (
        (bookedIn <= requestedIn && requestedIn < bookedOut) ||
        (bookedIn < requestedOut && requestedOut <= bookedOut)
      );
    });
    if (occupied) {
      return res.status(409).send({
        error: "this time is already booked on this slot.",
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
      _id: req.params.booking_id,
      user: req.user._id,
    });
    if (!booking) {
      throw new Error("Booking not found or you do not have permission.");
    }

    const parkingBooking = await ParkingBooking.find({
      parking: booking.parking,
      slot: booking.slot,
    }).populate("bookings");

    // logic of deleting booking and expired bookings id from parkingBooking
    const currentTime = new Date().getTime();
    const newBookigs = parkingBooking.bookings.filter((bkng) => {
      const bookedOut = new Date(bkng.out_time).getTime();
      return bookedOut >= currentTime || bkng._id !== booking._id;
    });
    parkingBooking.bookings = newBookigs;
    await parkingBooking.save();

    await booking.remove();
    res.send(booking);
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
      .sort({ in_time: -1 })
      .populate({
        path: "car",
        select: "car_no",
      })
      .populate({
        path: "parking",
        select: "parking_name",
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
          in_time: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
        select: "in_time out_time",
        options: { sort: { in_time: 1 } },
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
        const bookedOut = new Date(booking.out_time).getTime();
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
      options: { sort: { in_time: 1 } },
      populate: {
        path: "user car",
        select: "name car_no -_id",
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
      const bookedOut = new Date(booking.out_time).getTime();
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
  userBookings,
  parkingBookings,
  deleteBooking,
  parkingSlotBookings,
};
