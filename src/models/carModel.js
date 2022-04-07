const mongoose = require("mongoose");
const Booking = require("./bookingModel");
const carSchema = new mongoose.Schema({
  carNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
    validate(value) {
      const valid = /[A-Z]{2}[ ][0-9]{2}[ ][A-Z]{2}[ ][0-9]{4}/.test(value);
      if (!valid) {
        throw new Error("car no is invalid");
      }
    },
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

carSchema.pre("remove", async function (next) {
  const car = this;
  await Booking.deleteMany({
    car: car._id,
  });
  next();
});

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
