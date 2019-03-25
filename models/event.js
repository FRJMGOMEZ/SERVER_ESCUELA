const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    position: { type: Number, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    facilitie: { type: mongoose.Schema.Types.ObjectId, ref: 'Facilitie', required: true },
    hour: { type: Number, required: true },
    day: { type: Number, required: true },
    permanent: { type: Boolean, default: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    startDate: { type: Date },
    endDate: { type: Date },
});

module.exports = mongoose.model('EventModel', eventSchema);