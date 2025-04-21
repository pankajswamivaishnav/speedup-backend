const ErrorHandler = require("./errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Cast Error Mongodb ID Short & Invalid error
  if (err.name === "CastError") {
    const message = `Resource is not found ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong Json Web Token Error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid Json Web Token Please Try Again`;
  }

  // JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token Expired, Please Try Again`;
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
