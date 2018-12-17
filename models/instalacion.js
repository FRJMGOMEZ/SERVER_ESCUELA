const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema;

const instalacionSchema = new Schema({
    nombre: { type: String, unique: true, required: true },
});

instalacionSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

module.exports = mongoose.model('Instalacion', instalacionSchema);