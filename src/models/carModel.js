const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({
    car_no: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        validate(value) {
          return /[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}/.test(value);
        },
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

const Car = mongoose.model("Car", carSchema)
module.exports = Car;