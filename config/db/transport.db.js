const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/transportData")
  .then(() => {
    console.log(`Connection established`);
  })
  .catch((err) => {
    console.log(`No connection established ${err}`);
  });
