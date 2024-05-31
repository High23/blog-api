const User = require("../../models/user")
const bcrypt = require("bcryptjs");

async function validatePassword(req, res, next) {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(400).json({loginError: 'Username does not exist.'});
    } 
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      // passwords do not match!
      return res.status(400).json({loginError: "Invalid password"});
    }
    next()
}

module.exports = validatePassword