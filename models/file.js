const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    location: { type: String },
    name: { type: String, unique: true, required: [true, "Name is required"] },
    title: { type: String },
    download: { type: Boolean },
    format: { type: String },
    type: { type: String }
});

module.exports = mongoose.model('FileModel', fileSchema);