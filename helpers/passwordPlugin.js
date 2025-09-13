// passwordPlugin.js
const bcrypt = require("bcryptjs");

function passwordPlugin(schema) {
    schema.pre("save", async function (next) {
      if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      next();
    });
  
    schema.methods.comparePassword = async function (password) {
      return await bcrypt.compare(password, this.password);
    };
  }
  
  module.exports = passwordPlugin; 
  
