const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Project' },
    file: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'FileModel' },
    message: { type: String },
    date: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Message', messageSchema);