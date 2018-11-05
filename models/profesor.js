const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const profesorSchema = new Schema({
    nombre: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: [true, "Email es necesario"] },
    img: { type: String, required: false, default: undefined },
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
    sueldoFijo: { type: Number },
    pagosPendientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PagosPendientes' }],
    pagosRealizados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PagosRealizados' }],
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
}, { collection: 'profesores' });


profesorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Profesor', profesorSchema);