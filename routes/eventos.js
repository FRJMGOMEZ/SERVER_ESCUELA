const express = require('express');
const Evento = require('../models/evento');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.post('/event', verifyToken, (req, res) => {

    let body = req.body;

    let event = new Evento({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario.usuarioDb._id,
        profesores: body.profesores,
        materias: body.materias,
        instalacion: body.instalacion,
        duracion: body.duracion,
        posicion: body.posicion,
        repeticion: body.repeticion
    })

    event.save((err, eventSaved) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, eventSaved })
    })
})

module.exports = app;