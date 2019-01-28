const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const validTypes = {
    message: '{VALUE} no es un rol válido'
};

const eventoSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    duracion: { type: Number },
    posicion: { type: Number },
    repeticion: { type: Boolean, default: false },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    instalacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Instalacion' },
    profesores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profesor' }],
    materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
});

module.exports = mongoose.model('Evento', eventoSchema);