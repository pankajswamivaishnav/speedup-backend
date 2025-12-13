const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");
mongoose
  .connect("mongodb://127.0.0.1:27017/transportData")
  // .connect(MONGO_URI)
  .then(() => {
    console.log(`Connection established`);
  })
  .catch((err) => {
    console.log(`No connection established ${err}`);
  });
