const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const fichaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    apellido: { type: String },
    email: { type: String, unique: true },
    movil: { type: String, unique: true },
    casa: { type: String },
    domicilio: { type: String },
    estado: { type: Boolean, default: true }
}, { collection: 'Fichas' });

fichaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Ficha', fichaSchema);