const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const alumnoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre es necesario"] },
    img: { type: String, required: false, default: undefined },
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
    ficha: { type: mongoose.Schema.Types.ObjectId, ref: 'FichaAlumno' },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});

alumnoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Alumno', alumnoSchema);