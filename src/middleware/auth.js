const jwt = require("jsonwebtoken");
const Owner = require("../models/ownerModel");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "user") {
      const user = await User.findOne({
        _id: decoded._id,
      });
      if (!user) {
        throw new Error("not found");
      }
      await user.populate({
        path: "cars",
        select: "car_no",
      });
      await user.populate({
        path: "car",
        select: "car_no",
      });
      req.user = user;
    } else if (decoded.role === "owner") {
      const owner = await Owner.findOne({
        _id: decoded._id,
      });
      if (!owner) {
        throw new Error("not found");
      }
      req.owner = owner;
    }
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({
      Error: "Please Authenticate to access.",
    });
  }
};

module.exports = auth;
