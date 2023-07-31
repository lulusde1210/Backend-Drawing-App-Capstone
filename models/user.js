const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    drawings: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
//make sure the user email is unique using mongoose-unique-validator package

module.exports = mongoose.model('User', userSchema);