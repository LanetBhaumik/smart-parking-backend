const mongoose = require("mongoose");

const Car = require("../models/carModel");

const addCar = async (req, res) => {
  try {
    const car_id = new mongoose.Types.ObjectId();
    const car_no = req.body.car.toUpperCase();

    const carExists = await Car.findOne({
      car_no,
    });

    if (carExists) throw new Error(`${car_no} is already registered.`);

    const car = new Car({
      _id: car_id,
      car_no,
      owner: req.user._id,
    });

    await car.save();
    const updatedCars = [...req.user.cars, car_id];
    req.user.cars = updatedCars;
    await req.user.save();
    await req.user.populate({
      path: "cars",
      select: "car_no",
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
    const car = req.user.cars.find((car) => car == req.params.car_id);
    if (!car) throw new Error("car not found");
    req.user.car = req.params.car_id;
    await req.user.save();
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
    const car = await Car.findById(req.params.car_id);
    if (!car) throw new Error("car not found");

    if (req.user.cars.length === 1)
      throw new Error("Atleast One car is required.");

    const updatedCars = req.user.cars.filter((car) => {
      return car != req.params.car_id;
    });
    if (req.params.car_id == req.user.car) {
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
