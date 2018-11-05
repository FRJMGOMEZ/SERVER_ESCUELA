const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const tiposValidos = {
    values: ['profesor'],
    message: '{VALUE} no es un de tipo de transferencia válido'
}

const conceptosValidos = {
    values: ['ordinario', 'extraordinario'],
    message: '{VALUE} no es un concepto válido'
}

const pagosSchema = new Schema({
    importe: { type: Number },
    concepto: { type: String, enum: conceptosValidos, required: true },
    acreedor: { type: Schema.Types.ObjectId, required: true },
    clase: { type: String, enum: tiposValidos, required: true },
    descripcion: { type: String },
    pendiente: { type: Boolean, default: true },
    fechaDevengo: { type: Date },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});


module.exports = mongoose.model('Pago', pagosSchema);