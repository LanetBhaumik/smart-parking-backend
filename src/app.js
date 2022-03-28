const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/userRouter");
const carRouter = require("./routers/carRouter");
const ownerRouter = require("./routers/ownerRouter");
const parkingRouter = require("./routers/parkingRouter");
const bookingRouter = require("./routers/bookingRouter");

const cors = require("cors");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to smart parking");
});

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(carRouter);
app.use(ownerRouter);
app.use(parkingRouter);
app.use(bookingRouter);

app.get("*", (req, res) => {
  res.send("route does not exists");
});

module.exports = app;
