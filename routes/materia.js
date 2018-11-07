const express = require('express');

const Materia = require('../models/materia');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const app = express();



app.get('/materia', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Materia.find({})
        .populate('usuarios.id', 'nombre')
        .populate('alumnos', 'nombre')
        .populate('alumnos', 'nombre')
        .skip(desde)
        .limit(limite)
        .exec((err, materias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }
            if (!materias) {

                return res.status(404).json({
                    ok: false,
                    mensaje: 'No existen materias en la base de datos'
                })
            }
            res.status(200).json({
                ok: true,
                materias
            })
        })
})

app.post('/materia', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let timeStamp = req.timeStamp;

    let body = req.body;

    let materia = new Materia({
        nombre: body.nombre,
        usuarios: []
    })

    materia.usuarios.push(timeStamp)

    materia.save((err, materiaDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({
            ok: true,
            materiaDb
        })
    })
})

module.exports = app;