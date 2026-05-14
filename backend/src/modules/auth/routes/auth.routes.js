const express = require("express");
const authController = require("../controllers/auth.controller");
const asyncHandler = require("../../../utils/asyncHandler");

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));

module.exports = router;
