const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
    title: { type: String, minLength: 1, maxLength: 75, required: true },
    text: { type: String, minLength: 2, required: true },
    date: { type: Date },
    lastUpdated: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    published: { type: Boolean, default: true },
});

module.exports = mongoose.model('Post', postSchema);
