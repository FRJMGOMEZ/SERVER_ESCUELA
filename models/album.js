const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const albumSchema = new Schema({
    title: { type: String, unique: true, required: true },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    date: { type: Date, default: new Date() }
});

albumSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Album', albumSchema);