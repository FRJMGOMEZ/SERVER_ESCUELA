const express = require('express');

const Clase = require('../models/clase');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const app = express()


app.post('/clase', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;

    let clase = new Clase({
        nombre: body.nombre,
        usuarios: []
    })

    clase.usuarios.push(timeStamp)

    clase.save((err, claseSaved) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, mensaje: 'Clase creada', claseSaved })
    })
})
app.get('/clase', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Clase.find({})
        .skip(desde)
        .limit(limite)
        .populate('usuarios.id', 'nombre')
        .exec((err, clases) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }
            if (!clases) {

                return res.status(404).json({
                    ok: false,
                    mensaje: 'No existen clases en la base de datos'
                })
            }
            res.status(200).json({
                ok: true,
                clases
            })
        })
})

module.exports = app;