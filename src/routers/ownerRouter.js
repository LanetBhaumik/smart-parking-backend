const express = require("express");
const auth = require("../middleware/ownerAuth");
const router = new express.Router();
const {
  createOwner,
  loginOwner,
  ownerProfile,
  updateOwner,
  deleteOwner,
  uploadAvatar,
  deleteAvatar,
  upload,
  getAvatar,
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

//Upload avatar
router.post(
  "/owners/me/avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar,
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//delete avatar
router.delete("/owners/me/avatar", auth, deleteAvatar);

//GET image (Avatar) by user id
router.get("/owners/:id/avatar", getAvatar);

module.exports = router;
