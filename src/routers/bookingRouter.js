const express = require("express");
const {
  createBooking,
  userBookings,
  deleteBooking,
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
router.get("/bookings/me", auth, userBookings);

//Get all bookings of parking
router.get("/bookings/:parkingId", parkingBookings);

//Get all bookings of parking slot
router.get("/bookings/:parkingId/:slot", parkingSlotBookings);

module.exports = router;
