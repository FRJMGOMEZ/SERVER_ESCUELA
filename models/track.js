const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const trackSchema = new Schema({
    title: { type: String },
    assignations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignation' }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    percent: { type: Number, default: 100 }
});

module.exports = mongoose.model('Track', trackSchema);