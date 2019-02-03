const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const validRoles = {
    values: ['PROFESSOR', 'ALUMNI', 'ARTIST'],
    message: '{VALUE} is not a valid role'
};

const indexCardSchema = new Schema({
    name: { type: String, required: [true, 'name is required'] },
    surname: { type: String, required: false },
    email: { type: String, required: false },
    mobile: { type: String, required: false },
    home: { type: String, required: false },
    address: { type: String, required: false },
    status: { type: Boolean, default: true },
    img: { type: String, required: false, default: undefined },
    role: { type: String, required: true, enum: validRoles }
}, { collection: 'IndexCards' });

indexCardSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('IndexCard', indexCardSchema);