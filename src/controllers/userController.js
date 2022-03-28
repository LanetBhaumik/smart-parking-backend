const mongoose = require("mongoose");
const User = require("../models/userModel");
const sharp = require("sharp");
const multer = require("multer");
const Car = require("../models/carModel");
// const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const createUser = async (req, res) => {
  try {
    const user_id = new mongoose.Types.ObjectId();
    const car_id = new mongoose.Types.ObjectId();
    if (!req.body.car || req.body.car == "") {
      throw new Error(`you must add car_no to create profile`);
    }
    const carExists = await Car.findOne({
      car_no: req.body.car_no,
    });
    if (carExists) throw new Error("Car already exists");
    const car = new Car({
      _id: car_id,
      car_no: req.body.car,
      owner: user_id,
    });
    await car.save();

    const user = new User({
      _id: user_id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      mobile_no: req.body.mobile_no,
      car: car_id,
      cars: [car_id],
    });
    await user.save();
    // sendWelcomeEmail(user.email, user.name);
    await user.populate({
      path: "car",
      select: "car_no",
    });
    await user.populate({
      path: "cars",
      select: "car_no",
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
    // sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpef|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
  limits: {
    fileSize: 1000000,
  },
});

const uploadAvatar = async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
};

const deleteAvatar = async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
};

const getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  userProfile,
  updateUser,
  deleteUser,
  uploadAvatar,
  deleteAvatar,
  upload,
  getAvatar,
};
