const Parking = require("../models/parkingModel");
const mongoose = require("mongoose");
const ParkingBooking = require("../models/parkingBookingModal");

const createParking = async (req, res) => {
  try {
    const parkingId = new mongoose.Types.ObjectId();
    const parking = new Parking({
      _id: parkingId,
      ...req.body,
      owner: req.owner._id,
    });
    await parking.save();

    for (let i = 1; i <= req.body.total_slots; i++) {
      const parkingBooking = new ParkingBooking({
        parking: parkingId,
        slot: i,
        bookings: [],
      });
      await parkingBooking.save();
    }

    req.owner.parkings.push(parkingId);
    await req.owner.save();
    await req.owner.populate({
      path: "parkings",
    });
    res.status(201).send(req.owner);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

const readAllParkings = async (req, res) => {
  try {
    const parkings = await Parking.find()
      .populate({
        path: "owner",
        select: "name",
      })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));
    const totalResults = await Parking.count();
    if (parkings.length === 0) {
      throw new Error("No parking found");
    }
    res.send({
      parkings,
      totalResults,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

const readParking = async (req, res) => {
  try {
    const parking = await Parking.findOne({
      _id: req.params.parking_id,
    });
    if (!parking) {
      throw new Error("parking not found");
    }
    res.send(parking);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

const deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findOne({
      _id: req.params.parking_id,
      owner: req.owner._id,
    });
    if (!parking) {
      throw new Error("parking not found or you do not have permission");
    }
    await parking.remove();
    res.send(parking);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

module.exports = {
  createParking,
  readParking,
  deleteParking,
  readAllParkings,
};
