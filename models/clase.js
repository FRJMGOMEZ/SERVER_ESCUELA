const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const claseSchema = new Schema({
    nombre: { type: String, unique: true, required: true },
    disponible: { type: Boolean, default: true },
    ocupada: { type: Boolean, default: false },
    materia: { materia: { type: Schema.Types.ObjectId, ref: 'Materia' }, profesor: { type: Schema.Types.ObjectId, ref: 'Materia' } },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});
claseSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Clase', claseSchema);