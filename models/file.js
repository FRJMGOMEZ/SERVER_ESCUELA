const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    file: { data: Buffer, contentType: String },
    name: { type: String, unique: true, required: [true, "Name is required"] },
    title: { type: String },
    download: { type: Boolean },
    format: { type: String },
    type: { type: String }
});

module.exports = mongoose.model('FileModel', fileSchema);