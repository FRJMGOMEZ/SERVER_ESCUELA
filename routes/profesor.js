const express = require('express');

const Profesor = require('../models/profesor');
const Materia = require('../models/materia');
const timeStamp = require('../middlewares/timeStamp');
const { verifyToken } = require('../middlewares/auth');

const actualizarMateria = require('../pluggins/actualizarMateria');

const app = express();


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

app.post('/profesor', [verifyToken, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;

    let profesor = new Profesor({
        nombre: body.nombre,
        usuarios: [],
        materias: []
    })

    profesor.usuarios.push(timeStamp)

    profesor.materias.push(body.materia1)

    profesor.save((err, profesorGuardado) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, profesor })

    })
})


app.put('/profesorAnadirMateria/:id', (req, res) => {

    let id = req.params.id;
    let materiaId = req.body.materia;

    Profesor.findById(id, (err, profesorDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!profesorDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ningún profesor con el id introducido '
            })
        }

        profesorDb.materias.push(materiaId)

        profesorDb.save((err, profesorGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }

            actualizarMateria(res, profesorGuardado, materiaId, 'profesor').then((materiaUpdated) => {

                res.status(200).json({ ok: true, profesorGuardado, materiaActualizada: materiaUpdated.nombre })
            })
        })
    })
})

app.put('/profesor/:id', (req, res) => {

    let body = req.body;

    let id = req.params.id;


    Profesor.findById(id, (err, profesorDb) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!profesorDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ningún profesor con el id introducido '
            })
        }
        profesorDb.nombre = body.nombre;
    })
})

module.exports = app;