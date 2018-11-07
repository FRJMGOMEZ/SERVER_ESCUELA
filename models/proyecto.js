const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const proyectoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre del proyecto es necesario"] },
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    descripcion: { type: String },
    img: { type: String },
    mensajes: [{ mensaje: String, usuario: { type: mongoose.Types.ObjectId, ref: 'Usuario' } }],
    archivos: [{ archivo: String, usuario: { type: mongoose.Types.ObjectId, ref: 'Usuario' } }],
    imagenes: [{ imagen: String, usuario: { type: mongoose.Types.ObjectId, ref: 'Usuario' } }],
    finalizado: { type: Boolean, default: false },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});

proyectoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Proyecto', proyectoSchema);