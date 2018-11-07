const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const profesorSchema = new Schema({
    nombre: { type: String, unique: true, required: true },
    img: { type: String, required: false },
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    ficha: { type: mongoose.Schema.Types.ObjectId, ref: 'FichaProfesor' },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
}, { collection: 'profesores' });

profesorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Profesor', profesorSchema);