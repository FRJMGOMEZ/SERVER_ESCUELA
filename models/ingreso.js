const mongoose = require('mongoose');

const Schema = mongoose.Schema;


///Dependiendo si el alumno empieza con el mes o o no. 
const conceptosValidos = {
    values: ['ordinario', 'extraordinario'],
    message: '{VALUE} no es un concepto válido'
}

const clasesValidas = {
    values: ['alumno'],
    mensaje: '{VALUE} no es un clase válida'
}

const ingresoSchema = new Schema({
    importe: { type: Number },
    concepto: { type: String, enum: conceptosValidos, required: true },
    deudor: { type: Schema.Types.ObjectId, required: true },
    clase: { type: String, enum: clasesValidas, default: 'Alumno', required: true },
    descripcion: { type: String },
    pendiente: { type: Boolean, default: true },
    fechaDeCreacion: { type: Date.now },
    fechaDevengo: { type: Date },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});


module.exports = mongoose.model('Ingreso', ingresoSchema);