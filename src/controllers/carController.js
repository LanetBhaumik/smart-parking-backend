const mongoose = require("mongoose");

const Car = require("../models/carModel");

const addCar = async (req, res) => {
  try {
    const carId = new mongoose.Types.ObjectId();
    const carNo = req.body.car.toUpperCase();

    const carExists = await Car.findOne({
      carNo,
    });

    if (carExists) throw new Error(`${carNo} is already registered.`);

    const car = new Car({
      _id: carId,
      carNo,
      owner: req.user._id,
    });

    await car.save();
    const updatedCars = [...req.user.cars, carId];
    req.user.cars = updatedCars;
    await req.user.save();
    await req.user.populate({
      path: "cars",
      select: "carNo",
    });
    res.status(201).send({
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

const makeCarPrimary = async (req, res) => {
  try {
    const car = req.user.cars.find((car) => {
      return car._id == req.params.carId; // == for object id format and number format comparision
    });
    if (!car) throw new Error("car not found");
    req.user.car = req.params.carId;
    await req.user.save();
    await req.user.populate({
      path: "car",
      select: "carNo",
    });
    res.send({
      status: "success",
      message: `successfully set primary car`,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    res.send({
      error: error.message,
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) throw new Error("car not found");

    if (req.user.cars.length === 1)
      throw new Error("You can not delete. Atleast One car is required.");

    const updatedCars = req.user.cars.filter((car) => {
      return car._id != req.params.carId;
    });
    if (req.params.carId == req.user.car._id) {
      req.user.car = updatedCars[0];
    }
    req.user.cars = updatedCars;
    await req.user.save();
    await car.remove();
    res.send({
      status: "success",
      message: `car is deleted successfully`,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};

module.exports = { addCar, makeCarPrimary, deleteCar };
