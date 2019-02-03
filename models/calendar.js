const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const calendarSchema = new Schema({
    monday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    tuesday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    wednesday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    thursday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    friday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    saturday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    sunday: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    date: { type: Date }
});

module.exports = mongoose.model('Calendar', calendarSchema);