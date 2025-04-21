const passport = require("passport");
const passportJWT = require("passport-jwt");
const constants = require("../helpers/constants");
const Transporter = require("../config/models/transporterSchema.model");

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;



passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "iampankajswamivaishnav7073272134",
    },
    async (jwtPayload, cb) => {
      try {
        const user = await Transporter.findOne({ _id: jwtPayload.id });

        if (user) {
          return cb(null, user); // ✅ user found
        } else {
          return cb(null, false); // ❌ no user found
        }
      } catch (err) {
        console.error("Error in passport JWT strategy:", err);
        return cb(err, false); // ❌ error occurred
      }
    }
  )
);

module.exports = passport;
