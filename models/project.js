const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')


const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: { type: String, unique: true, required: [true, "Name is required"] },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }],
    administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }],
    img: { type: mongoose.Schema.Types.ObjectId, ref: 'FileModel' },
    description: { type: String },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    status: { type: Boolean, default: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

projectSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Project', projectSchema);