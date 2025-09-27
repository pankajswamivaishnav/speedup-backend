const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
// middleware Function Import
const errorMiddleware = require("./utils/errMessage");
// Database connection
require("./config/db/transport.db");
const cors = require("cors");
// Import Third Party Libraries
const cookieParser = require("cookie-parser");
// Import Route
const AuthRoute = require("./routes/auth.routes");
const Transport = require("./routes/transport/transport.routes");
const BiltyRoute = require("./routes/bilty/bilty.routes");
const DriverRoute = require("./routes/driver/driver.routes");
const VendorRoute = require("./routes/vendors/vendor.routes");
const passport = require("passport");
require("./helpers/passport");

// Middlewares
console.log("insert in to the server.js")
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors());
app.use("/api/v1", Transport);
app.use("/api/v1", BiltyRoute);
app.use("/api/v1", DriverRoute);
app.use("/api/v1", VendorRoute);
app.use("/api/v1", AuthRoute);;
app.use(errorMiddleware);

// Listening on port
app.listen(port, (error) => {
  if (error) {
    console.log(`listening on port ${error.message}`);
  } else {
    console.log(`listening on port ${port}`);
  }
});
