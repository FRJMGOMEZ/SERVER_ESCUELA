const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const daySchema = new Schema({
    date: { type: Date, required: true },
    '0': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '1': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '2': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '3': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '4': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '5': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '6': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '7': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '8': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '9': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '10': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
    '11': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento', default: null }],
})

module.exports = mongoose.model('Day', daySchema);