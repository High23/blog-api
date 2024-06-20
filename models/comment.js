const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
    text: { type: String, minLength: 2, maxLength: 250, required: true },
    date: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    post: { type: Schema.Types.ObjectId, ref: 'Post', default: undefined },
});

module.exports = mongoose.model('Comment', commentSchema);
