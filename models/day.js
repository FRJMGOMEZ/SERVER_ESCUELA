const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const daySchema = new Schema({
    date: { type: Date, required: true },
    day: { type: Number, required: true },
    hour0: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour3: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour4: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour5: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour6: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour7: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour8: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour9: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour10: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
    hour11: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }],
})

module.exports = mongoose.model('Day', daySchema);