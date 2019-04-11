const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const facilitieSchema = new Schema({
    name: { type: String, unique: true, required: true },
    status: { type: Boolean, default: true }
});

facilitieSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Facilitie', facilitieSchema);