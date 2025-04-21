import constants from "../helpers/constants";

export const checkUserPermission = (requiredRole) => {
  return (req, res, next) => {
    // Check if user is authenticated
    const user = req.user;

    if (!user) {
      res
        .status(constants.STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Authentication required." });
      return;
    }
    let roleCheck = false;
    user.roles.find((role) => {
      if (requiredRole.includes(role)) {
        roleCheck = true;
        return;
      }
    });
    if (!roleCheck) {
      res.status(constants.STATUS_CODES.FORBIDDEN).json({
        message: "Forbidden: You do not have the necessary permissions.",
      });
      return;
    }
    next();
  };
};
