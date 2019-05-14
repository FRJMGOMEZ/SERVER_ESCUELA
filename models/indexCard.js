const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const validRoles = {
    values: ['PROFESSOR', 'ALUMNI', 'ARTIST'],
    message: '{VALUE} is not a valid role'
};

const indexcardSchema = new Schema({
    name: { type: String, required: [true, 'name is required'], unique: true },
    surname: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    mobile: { type: String, required: false },
    home: { type: String, required: false },
    address: { type: String, required: false },
    status: { type: Boolean, default: true },
    role: { type: String, required: true, enum: validRoles }
});

indexcardSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Indexcard', indexcardSchema);