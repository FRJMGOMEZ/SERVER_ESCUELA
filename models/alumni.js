const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const alumniSchema = new Schema({
    name: { type: String, unique: true, required: true },
    img: { type: String, required: false },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'IndexCard' },
    users: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: String }]
});

alumniSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Alumni', alumniSchema);