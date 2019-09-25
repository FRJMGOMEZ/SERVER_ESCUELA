const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    amount: { type: Number, default: 0 },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
    artist:{type:mongoose.Schema.Types.ObjectId, ref: 'Artist'},
    date: { type: Date, default: new Date() },
    sent: { type: Boolean },
    sentDate: {type:Date}
});

module.exports = mongoose.model('Payment', paymentSchema);