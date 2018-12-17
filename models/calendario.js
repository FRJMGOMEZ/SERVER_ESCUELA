const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const calendarioSchema = new Schema({
    lunes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    martes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    miercoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    jueves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    viernes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    sabado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    domingo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
    fecha: { type: Date }
});

module.exports = mongoose.model('Calendario', calendarioSchema);