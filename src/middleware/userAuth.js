const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
    });
    if (!user) {
      throw new Error("user not found");
    }
    await user.populate({
      path: "cars",
      select: "car_no",
    });
    await user.populate({
      path: "car",
      select: "car_no",
    });
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({
      Error: "Please Authenticate as a user to access.",
    });
  }
};

module.exports = userAuth;
