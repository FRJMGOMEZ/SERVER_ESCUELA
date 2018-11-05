const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const alumnoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre es necesario"] },
    email: { type: String, unique: true, required: [true, "El email es necesario"] },
    fechaDeNacimiento: { type: Date, required: [true, "La fecha de nacimiento es necesaria"] },
    img: { type: String, required: false, default: undefined },
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
    ingresosRealizados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IngresoRealizado' }],
    ingresosPendientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IngresoPendiente' }],
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});

alumnoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Alumno', alumnoSchema);