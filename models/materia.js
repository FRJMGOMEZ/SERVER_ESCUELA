const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const materiaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre es necesario"] },
    profesores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pofesor' }],
    alumnos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumno' }],
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
})

materiaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })


module.exports = mongoose.model('Materia', materiaSchema);