// passwordPlugin.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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

function resetPasswordTokenPlugin(schema) {
    schema.methods.genResetPasswordToken = function () {
      // Generate token
      const token = crypto.randomBytes(20).toString("hex");
      const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  
      // Assign to schema fields (ensure your schema has these fields)
      this.resetPasswordToken = hashToken;
      this.resetPasswordExpire = Date.now() + 50 * 60 * 1000; // 50 mins
  
      return token;
    };
  }
  
module.exports = {
  passwordPlugin,
  resetPasswordTokenPlugin
};
  
