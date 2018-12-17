const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const proyectoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre del proyecto es necesario"] },
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    administradores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    descripcion: { type: String },
    img: { type: String },
    mensajes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mensaje' }],
    archivos: [{ type: String }],
    imagenes: [{ type: String }],
    activo: { type: Boolean, default: true },
    usuarios: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: String }]
});

proyectoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Proyecto', proyectoSchema);