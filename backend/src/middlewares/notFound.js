function notFound(req, res) {
  return res.status(404).json({
    code: "NOT_FOUND",
    message: "Route not found"
  });
}

module.exports = notFound;
