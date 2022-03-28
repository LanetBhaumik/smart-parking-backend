const express = require("express");
const router = new express.Router();

const auth = require("../middleware/auth");

const {
  createParking,
  readParking,
  deleteParking,
  readAllParkings,
} = require("../controllers/parkingController");

// Create Parking
router.post("/owners/parkings", auth, createParking);

// Read All Parkings
//GET /parkings?limit=10&skip=0
router.get("/parkings", readAllParkings);

// Read Parking
router.get("/parkings/:parking_id", readParking);

// Delete Parking
router.delete("/parkings/:parking_id", auth, deleteParking);

module.exports = router;
