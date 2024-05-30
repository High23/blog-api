const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, minLength: 3, maxLength: 100, required: true},
    password: {type: String, minLength: 7, required: true},
    role: {type: String, enum: ['author', 'user'], required: 'user'},
});

module.exports = mongoose.model("User", UserSchema);