
require("dotenv").config();
const passport = require("passport");
const passportJWT = require("passport-jwt");
const Transporter = require("../config/models/transporterSchema.model");
const Driver = require("../config/models/driver.model");
const Vendor = require("../config/models/vendors.models");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const { JWT_SECRET } = require('../config/config');
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, cb) => {
      try {
      let user; 
        const [ transporter, driver, vendor ] = await Promise.all([
          Transporter.findOne({_id:jwtPayload.id}),
          Driver.findOne({_id:jwtPayload.id}),
          Vendor.findOne({_id:jwtPayload.id})
        ]);
        if(transporter){
          user = transporter
        }else if(driver){
          user = driver
        }else{
          user = vendor
        }
       
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
