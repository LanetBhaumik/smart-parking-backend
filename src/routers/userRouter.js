const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const {
  createUser,
  loginUser,
  userProfile,
  updateUser,
  deleteUser,
  uploadAvatar,
  deleteAvatar,
  upload,
  getAvatar,
} = require("../controllers/userController");

//get profile
router.get("/profile", auth, (req, res) => {
  try {
    if (req.user) {
      res.send({
        user: req.user,
        token: req.token,
      });
    } else if (req.owner) {
      res.send({
        owner: req.owner,
        token: req.token,
      });
    }
  } catch (error) {
    res.status(400).send({
      error: "bad request",
    });
  }
});

//new user creation
router.post("/users", createUser);

//user login
router.post("/users/login", loginUser);

//get user profile
router.get("/users/me", auth, userProfile);

//update logged in user
router.patch("/users/me", auth, updateUser);

//Delete loggedin user
router.delete("/users/me", auth, deleteUser);

//Upload avatar
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar,
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//delete avatar
router.delete("/users/me/avatar", auth, deleteAvatar);

//GET image (Avatar) by user id
router.get("/users/:id/avatar", getAvatar);

module.exports = router;
