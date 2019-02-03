const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number },
    position: { type: Number },
    repetition: { type: Boolean, default: false },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    facilitie: { type: mongoose.Schema.Types.ObjectId, ref: 'Facilitie' },
    professors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
});

module.exports = mongoose.model('Event', eventSchema);