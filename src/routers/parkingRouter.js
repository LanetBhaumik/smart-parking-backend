const express = require("express");
const router = new express.Router();

const Auth = require("../middleware/ownerAuth");

const {
  createParking,
  readParking,
  deleteParking,
  readAllParkings,
} = require("../controllers/parkingController");

// Create Parking
router.post("/owners/parkings", Auth, createParking);

// Read All Parkings
//GET /parkings?limit=10&skip=0
router.get("/parkings", readAllParkings);

// Read Parking
router.get("/parkings/:parking_id", readParking);

// Delete Parking
router.delete("/parkings/:parking_id", Auth, deleteParking);

module.exports = router;
