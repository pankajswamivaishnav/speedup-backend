const { generateToken } = require("../helpers/function");

const setCookieToken = async (user, statusCode, message, res, keepSignedIn) => {
  const token = await generateToken({ id: user._id.toString() });
  const cookieExpiry = keepSignedIn
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  // Make Options object for setCookieToken
  const options = {
    expires: new Date(Date.now() + cookieExpiry),
    httpOnly: true,
    // secure:true  // when https set cookie or http not set cookie
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
