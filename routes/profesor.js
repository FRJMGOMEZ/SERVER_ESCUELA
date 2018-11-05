const express = require('express');

const Profesor = require('../models/profesor');
const Materia = require('../models/materia');
const timeStamp = require('../middlewares/timeStamp');
const { verifyToken } = require('../middlewares/auth');

const app = express();

app.post('/profesor', [verifyToken, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;

    let profesor = new Profesor({
        nombre: body.nombre,
        email: body.email,
        sueldoFijo: body.sueldoFijo,
        usuarios: [],
        materias: []
    })

    profesor.usuarios.push(timeStamp)

    profesor.materias.push(body.materia)

    profesor.save((err, profesor) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }
        actualizarMateria(res, profesor, profesor.materias[0])
    })
})


app.get('/profesor', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Profesor.find({})
        .populate('materias')
        .skip(desde)
        .limit(limite)
        .exec((err, profesoresDb) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }
            if (!profesoresDb) {

                return res.status(404).json({
                    ok: false,
                    mensaje: 'No existen profesores en la base de datos'
                })
            }
            res.status(200).json({
                ok: true,
                profesores: profesoresDb
            })
        })
})


let actualizarMateria = (res, profesor, idMateria) => {


    Materia.findById(idMateria, (err, materiaDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!materiaDb) {
            return res.status(404).json({ ok: false, mensaje: 'No se encontraron Materias' })
        }

        materiaDb.profesores.push(profesor._id)

        materiaDb.save((err, materiaUpdated) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Profesor creado',
                profesor
            })
        })
    })
}


module.exports = app;