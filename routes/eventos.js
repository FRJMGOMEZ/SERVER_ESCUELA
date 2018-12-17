const express = require('express');
const Evento = require('../models/evento');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/eventos', verifyToken, (req, res) => {

    Evento.find({}, (err, eventosDb) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        if (!eventosDb) {

            res.status(404).json({ ok: false, mensaje: 'No existen eventos en la base de datos' })
        }

        res.status(200).json({ ok: true, eventosDb })
    })
})

app.post('/evento', verifyToken, (req, res) => {

    let body = req.body;

    let event = new Evento({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario.usuarioDb._id,
        profesores: body.profesores,
        materias: body.materias,
        duracion: body.duracion,
        posicion: body.posicion,
        repeticion: body.repeticion
    })

    event.save((err, eventoGuardado) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, eventoGuardado })
    })
})







module.exports = app;