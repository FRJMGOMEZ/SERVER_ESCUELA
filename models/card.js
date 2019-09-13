const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const indexcardSchema = new Schema({
    name: { type: String, required: [true, 'name is required'], unique: true },
    surname: { type: String, required: false },
    email: { type: String, required: false, unique: true, required: [true, 'email is required'] },
    mobile: { type: String, required: false },
    home: { type: String, required: false },
    address: { type: String, required: false }
});

indexcardSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Indexcard', indexcardSchema);