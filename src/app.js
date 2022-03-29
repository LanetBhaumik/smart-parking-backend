const express = require("express");
require("./db/mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compress = require("compression");
const methodOverride = require("method-override");

const userRouter = require("./routers/userRouter");
const carRouter = require("./routers/carRouter");
const ownerRouter = require("./routers/ownerRouter");
const parkingRouter = require("./routers/parkingRouter");
const bookingRouter = require("./routers/bookingRouter");

const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(carRouter);
app.use(ownerRouter);
app.use(parkingRouter);
app.use(bookingRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to smart parking");
});

app.get("*", (req, res) => {
  res.send("route does not exists");
});

module.exports = app;
