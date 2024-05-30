const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {type: String, minLength: 2, maxLength: 250, required: true},
    date: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", default: undefined},
});

module.exports = mongoose.model("Comment", commentSchema);