const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const artistSchema = new Schema({
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Indexcard' },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
});

artistSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Artist', artistSchema);