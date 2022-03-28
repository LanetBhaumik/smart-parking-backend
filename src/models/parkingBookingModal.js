const mongoose = require("mongoose");

const parkingBookingSchema = new mongoose.Schema({
  parking: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Parking",
  },
  slot: {
    type: Number,
    required: true,
  },
  bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Booking",
    },
  ],
});

parkingBookingSchema.methods.toJSON = function() {
  const parkingBooking = this;
  const parkingBookingObject = parkingBooking.toObject();
  delete parkingBookingObject.createdAt;
  delete parkingBookingObject.updatedAt;
  delete parkingBookingObject.__v;
  return parkingBookingObject;
};

const ParkingBooking = mongoose.model("ParkingBooking", parkingBookingSchema);

module.exports = ParkingBooking;
