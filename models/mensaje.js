const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mensajeSchema = new Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Usuario' },
    proyecto: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Proyecto' },
    img: { type: String },
    file: { type: String },
    mensaje: { type: String },
    date: { type: Date, default: new Date() },
    titulo: { type: String }
});

module.exports = mongoose.model('Mensaje', mensajeSchema);