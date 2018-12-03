const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const notaSchema = new Schema({
    contenido: { type: String, required: true },
    fecha: { type: Date, default: new Date() }
})


module.exports = mongoose.model('Nota', notaSchema);