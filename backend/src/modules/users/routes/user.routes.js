const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../../../middlewares/authenticate");
const asyncHandler = require("../../../utils/asyncHandler");

const router = express.Router();

router.get("/me", authenticate, asyncHandler(userController.getMe));
router.patch("/me", authenticate, asyncHandler(userController.updateMe));
router.delete("/me", authenticate, asyncHandler(userController.deleteMe));

module.exports = router;
