const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const validTypes = {
    message: '{VALUE} no es un rol válido'
};

const eventoSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    profesores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profesor' }],
    alumnos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profesor' }],
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
    duracion: { type: Number },
    posicion: { type: Number },
    repeticion: { type: Boolean, default: false },
});

module.exports = mongoose.model('Evento', eventoSchema);