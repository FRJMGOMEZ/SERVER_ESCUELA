const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema;

const validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
};

const userSchema = new Schema({
    name: { type: String, unique: true, required: [true, "Name is required"] },
    email: { type: String, unique: true, required: [true, "Email is required"] },
    password: { type: String, required: [true, "Password is required"] },
    img: { type: String, required: false, default: undefined },
    role: {
        type: String,
        required: false,
        default: "USER_ROLE",
        enum: validRoles
    },
    status: { type: Boolean, default: false },
    google: { type: Boolean, default: false },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
});

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('User', userSchema);