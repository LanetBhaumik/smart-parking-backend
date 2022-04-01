const express = require("express");
const {
  createBooking,
  deleteBooking,
  userBookings,
  carBookings,
  parkingBookings,
  parkingSlotBookings,
} = require("../controllers/bookingController");
const router = new express.Router();

const auth = require("../middleware/auth");

// New booking
router.post("/bookings", auth, createBooking);

// Delete booking
router.delete("/bookings/:bookingId", auth, deleteBooking);

// Get all bookings of user
router.get("/bookings/user/me", auth, userBookings);

// Get all bookings of car
router.get("/bookings/car/:carId", auth, carBookings);

//Get all bookings of parking
router.get("/bookings/parking/:parkingId", parkingBookings);

//Get all bookings of parking slot
router.get("/bookings/parking/:parkingId/:slot", parkingSlotBookings);

module.exports = router;
