const authService = require("../services/auth.service");
const logger = require("../../../utils/logger");

async function signup(req, res) {
  logger.info("Auth signup requested", { email: req.body?.email });
  const user = await authService.signup(req.body || {});
  logger.info("Auth signup completed", { userId: user.id });
  return res.status(201).json({ data: user });
}

async function login(req, res) {
  logger.info("Auth login requested", { email: req.body?.email });
  const data = await authService.login(req.body || {});
  logger.info("Auth login completed", { userId: data.user.id });
  return res.status(200).json({ data });
}

async function logout(req, res) {
  logger.info("Auth logout requested");
  authService.logout();
  logger.info("Auth logout completed");
  return res.status(204).send();
}

module.exports = {
  login,
  logout,
  signup
};
