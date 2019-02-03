const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: { type: String, unique: true, required: [true, "Name is required"] },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String },
    img: { type: String },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    files: [{ type: String }],
    images: [{ type: String }],
    active: { type: Boolean, default: true },
    tasks: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }]
});

projectSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Project', projectSchema);