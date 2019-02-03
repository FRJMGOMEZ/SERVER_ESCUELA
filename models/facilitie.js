const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const facilitieSchema = new Schema({
    name: { type: String, unique: true, required: true },
    days: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }],
    status: { type: Boolean, default: true }
});

facilitieSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Facilitie', facilitieSchema);