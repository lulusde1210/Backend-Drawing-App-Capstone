const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const drawingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imgURL: { type: String, required: true },
    imgJSON: { type: String, required: true },
    artist: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    //establish one to many relationship
});

module.exports = mongoose.model('Drawing', drawingSchema);