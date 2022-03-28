const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  in_time: {
    type: Date,
    required: true,
  },
  out_time: {
    type: Date,
    required: true,
  },
  car: {
    type: mongoose.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  parking: {
    type: mongoose.Types.ObjectId,
    ref: "Parking",
    required: true,
  },
  slot: {
    type: Number,
    required: true,
  },
  charge: {
    type: Number,
    trim: true,
    required: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
