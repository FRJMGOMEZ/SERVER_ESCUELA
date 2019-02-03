const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    name: { type: String, unique: true, required: [true, "Name is required"] },
    professors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
    alumnis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }]
})

subjectSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Subject', subjectSchema);