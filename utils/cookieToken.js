const { generateToken } = require("../helpers/function");

const setCookieToken = async (user, statusCode, message, res) => {
  const token = await generateToken({ id: user._id.toString() });

  // Make Options object for setCookieToken
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      data: { serviceToken: token, user: user },
    });
};

module.exports = setCookieToken;
