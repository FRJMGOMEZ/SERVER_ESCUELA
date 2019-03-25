const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    description: { type: String, required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Project' },
    date: { type: Date, default: new Date() },
    dateLimit: { type: Date, default: new Date() },
    ok: { type: Boolean, default: false },
    checked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Task', taskSchema);