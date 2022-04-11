const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const {
  createOwner,
  loginOwner,
  ownerProfile,
  updateOwner,
  deleteOwner,
} = require("../controllers/ownerController");

// Sign Up Parking Owner
router.post("/owners", createOwner);

//user login
router.post("/owners/login", loginOwner);

//get user profile
router.get("/owners/me", auth, ownerProfile);

//update logged in user
router.patch("/owners/me", auth, updateOwner);

//Delete loggedin user
router.delete("/owners/me", auth, deleteOwner);

module.exports = router;
