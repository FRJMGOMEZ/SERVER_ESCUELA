const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema;

const validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
};

const validTypes = {
    values: [`ARTIST`, 'ALUMNI', 'PROFESSOR']
}

const userSchema = new Schema({
    name:{type:String,require:true, unique:true},
    email:{type:String,require:true, unique:true},
    password: { type: String, required: [true, "Password is required"] },
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'FileModel' },
    role: {
        type: String,
        required: false,
        default: "USER_ROLE",
        enum: validRoles
    },
    type: [{
        type: String,
        required: false,
        enum: validTypes
    }],
    status: { type: Boolean, default: false },
    projects: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, lastConnection: { type: Date } }],
    resetCode: { type: String }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('User', userSchema);