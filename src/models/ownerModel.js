const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const Parking = require("./parkingModel");

const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    mobile_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value, ["en-IN"])) {
          throw new Error("Mobile No is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: [7, "password must be 7 or more characters"],
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password field must not contains word 'password'.");
        }
      },
    },
    parkings: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Parking",
      },
    ],
  },
  {
    timestamps: true,
  }
);

ownerSchema.methods.generateAuthToken = async function () {
  const owner = this;
  const token = jwt.sign(
    { _id: owner._id.toString(), role: "owner" },
    process.env.JWT_SECRET
  );
  await owner.save();
  return token;
};

ownerSchema.methods.toJSON = function () {
  const owner = this;
  const ownerObject = owner.toObject();
  delete ownerObject.password;
  delete ownerObject.createdAt;
  delete ownerObject.updatedAt;
  delete ownerObject.__v;
  return ownerObject;
};

ownerSchema.statics.findByCredentials = async (email, password) => {
  const owner = await Owner.findOne({ email });
  if (!owner) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, owner.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return owner;
};

//Hash the plain text password before saving
ownerSchema.pre("save", async function (next) {
  const owner = this; //'this' is a document that is going to be save.

  if (owner.isModified("password")) {
    owner.password = await bcrypt.hash(owner.password, 8);
  }

  next(); // it runs after function runs
});

//Delete parkings of owner when owner delete accout
ownerSchema.pre("remove", async function (next) {
  const owner = this;
  await Parking.deleteMany({
    owner: owner._id,
  });

  next();
});

const Owner = mongoose.model("Owner", ownerSchema);

module.exports = Owner;
