const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema;

const validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

const usuarioSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, "El nombre es necesario"] },
    email: { type: String, unique: true, required: [true, "El nombre es necesario"] },
    password: { type: String, required: [true, "Contraseña es necesaria"] },
    img: { type: String, required: false, default: undefined },
    rol: {
        type: String,
        required: false,
        default: "USER_ROLE",
        enum: validRoles
    },
    estado: { type: Boolean, default: false },
    google: { type: Boolean, default: false },
    proyectos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' }],
    historial: [{ type: mongoose.Schema.Types.ObjectId, fecha: String, ref: 'AccionHistorial' }],
    usuarios: [{ type: mongoose.Schema.Types.ObjectId, fecha: String, ref: 'Usuario' }],
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único ' })

module.exports = mongoose.model('Usuario', usuarioSchema);