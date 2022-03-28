const jwt = require("jsonwebtoken");
const Owner = require("../models/ownerModel");

const ownerAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner = await Owner.findOne({
      _id: decoded._id,
    });
    if (!owner) {
      throw new Error("owner not found");
    }
    req.token = token;
    req.owner = owner;
    next();
  } catch (error) {
    res.status(401).send({
      Error: "Please Authenticate as a parking owner to access.",
    });
  }
};

module.exports = ownerAuth;
