const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const professorSchema = new Schema({
    name: { type: String, unique: true, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'IndexCard' },
}, { collection: 'professors' });

professorSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Professor', professorSchema);