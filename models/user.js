const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, minLength: 1, maxLength: 100, required: true},
    password: {type: String, minLength: 7, required: true},
    author: {type: Boolean},
});

module.exports = mongoose.model("User", UserSchema);