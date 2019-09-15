const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
    indexcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Indexcard' },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
});


module.exports = mongoose.model('Artist', artistSchema);