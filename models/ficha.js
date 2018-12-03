const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const fichaSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    apellido: { type: String, required: false },
    email: { type: String, required: false },
    movil: { type: String, required: false },
    casa: { type: String, required: false },
    domicilio: { type: String, required: false },
    estado: { type: Boolean, default: true }
}, { collection: 'fichas' });

fichaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Ficha', fichaSchema);