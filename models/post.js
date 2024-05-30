const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {type: String, minLength: 1, maxLength: 75, required: true},
    text: {type: String, minLength: 2, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", default: undefined},
    type: {type: String, enum: ['published', 'not published'], required: 'published'}
});

module.exports = mongoose.model("Post", postSchema)