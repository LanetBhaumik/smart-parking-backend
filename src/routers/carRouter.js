const express = require("express");
const router = new express.Router();

const {
  addCar,
  makeCarPrimary,
  deleteCar,
} = require("../controllers/carController");
const auth = require("../middleware/auth");

// Add New Car
router.post("/user/cars", auth, addCar);

// Set Car As Primary
router.post("/user/primaryCar/:carId", auth, makeCarPrimary);

// Delete Car
router.delete("/user/cars/:carId", auth, deleteCar);

module.exports = router;
