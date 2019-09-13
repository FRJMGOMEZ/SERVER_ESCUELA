const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const assignationSchema = new Schema({
    album: { type: mongoose.Schema.Types.ObjectId,ref:'Album'},
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    percent: { type: Number, default: 0 }
});

module.exports = mongoose.model('Assignation', assignationSchema);