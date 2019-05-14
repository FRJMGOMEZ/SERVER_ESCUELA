const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const artistSchema = new Schema({
    name: { type: String, unique: true, required: true },
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Indexcard' },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

artistSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Artist', artistSchema);