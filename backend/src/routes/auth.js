const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validate,
  registerValidation,
  loginValidation,
} = require("../middleware/validator");

router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
