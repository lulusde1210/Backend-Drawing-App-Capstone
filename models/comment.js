const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    body: { type: String, required: true },
    drawing: { type: mongoose.Types.ObjectId, required: true, ref: 'Drawing' },
    author: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Comment', commentSchema);