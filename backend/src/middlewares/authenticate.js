const userRepository = require("../modules/users/repositories/user.repository");
const { unauthorized } = require("../utils/appError");
const { verifyToken } = require("../utils/jwt");

async function authenticate(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    const match = /^Bearer\s+(.+)$/i.exec(header);

    if (!match) {
      throw unauthorized("Authentication required");
    }

    const payload = verifyToken(match[1]);
    const userId = payload.userId || payload.sub;

    if (!userId) {
      throw unauthorized("Invalid token");
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw unauthorized("Invalid token");
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
