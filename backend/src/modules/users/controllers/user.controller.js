const userService = require("../services/user.service");
const logger = require("../../../utils/logger");

async function getMe(req, res) {
  logger.info("User profile read requested", { userId: req.userId });
  const user = await userService.getMe(req.userId);
  logger.info("User profile read completed", { userId: user.id });
  return res.status(200).json({ data: user });
}

async function updateMe(req, res) {
  logger.info("User profile update requested", { userId: req.userId });
  const user = await userService.updateMe(req.userId, req.body || {});
  logger.info("User profile update completed", { userId: user.id });
  return res.status(200).json({ data: user });
}

async function deleteMe(req, res) {
  logger.info("User deletion requested", { userId: req.userId });
  await userService.deleteMe(req.userId);
  logger.info("User deletion completed", { userId: req.userId });
  return res.status(204).send();
}

module.exports = {
  deleteMe,
  getMe,
  updateMe
};
