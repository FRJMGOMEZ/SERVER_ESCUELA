const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    amount: { type: Number, default: 0 },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
    date: { type: Date, default: new Date() },
    sent: { type: Boolean, default: false }
});


module.exports = mongoose.model('Payment', paymentSchema);