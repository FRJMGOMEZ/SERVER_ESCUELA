const express = require('express');
const app = express();

const { verifyToken } = require('../middlewares/auth');

const Instalacion = require('../models/instalacion');



app.get('/instalacion', verifyToken, (req, res) => {

    Instalacion.find({}, (err, instalacionesDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!instalacionesDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen instalaciones en la base de datos' })
        }

        res.status(200).json({ ok: true, instalacionesDb })
    })
})

app.post('/instalacion', verifyToken, (req, res) => {

    let body = req.body;

    let instalacion = new Instalacion({ nombre: body.nombre });

    instalacion.save((err, instalacionGuardada) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: false, instalacionGuardada })
    })
})

module.exports = app;