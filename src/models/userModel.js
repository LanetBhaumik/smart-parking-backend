const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const Car = require("./carModel");

const userSchema = new mongoose.Schema(
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
    mobileNo: {
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
    car: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Car",
    },
    cars: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Car",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString(), role: "user" },
    process.env.JWT_SECRET,
    {
      expiresIn: "30m",
    }
  );
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
    .populate({
      path: "cars",
      select: "carNo",
    })
    .populate({
      path: "car",
      select: "carNo",
    });
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }
  return user;
};

//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this; //'this' is a document that is going to be save.

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next(); // it runs after function runs
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Car.deleteMany({
    owner: user._id,
  });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
