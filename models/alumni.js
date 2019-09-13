const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const alumniSchema = new Schema({
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Indexcard' },
});

alumniSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Alumni', alumniSchema);