const mongoose = require("mongoose");
const User = require("../models/userModel");
const sharp = require("sharp");
const multer = require("multer");
const Car = require("../models/carModel");

const createUser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId();
    const carId = new mongoose.Types.ObjectId();
    if (!req.body.car || req.body.car == "") {
      throw new Error(`you must add car number to create profile`);
    }
    const carExists = await Car.findOne({
      carNo: req.body.carNo,
    });
    if (carExists) throw new Error("Car already exists");
    const car = new Car({
      _id: carId,
      carNo: req.body.car,
      owner: userId,
    });
    await car.save();

    const user = new User({
      _id: userId,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      mobileNo: req.body.mobileNo,
      car: carId,
      cars: [carId],
    });
    await user.save();
    await user.populate({
      path: "car",
      select: "carNo",
    });
    await user.populate({
      path: "cars",
      select: "carNo",
    });
    const token = await user.generateAuthToken();
    res.status(201).send({
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      const keys = Object.keys(error.keyValue);
      return res.status(400).send({
        error: `This ${keys[0]} is already being used`,
      });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      const customErrors = {};
      for (field in error.errors) {
        customErrors[field] = error.errors[field].message;
      }
      return res.status(400).send({
        error: customErrors,
      });
    }
    res.status(400).send({
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
};

const userProfile = async (req, res) => {
  res.send(req.user);
};

const updateUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ["name", "password"];
  const isValidOperation = updates.every((update) => {
    return allowedupdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  userProfile,
  updateUser,
  deleteUser,
};
