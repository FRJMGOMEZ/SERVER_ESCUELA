const express = require('express');

const Alumno = require('../models/alumno');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const actualizarMateria = require('../pluggins/actualizarMateria');

const app = express()


app.get('/alumno', [verifyToken, timeStamp], (req, res) => {

    let desde = req.query.desde;
    let hasta = req.query.hasta;

    Alumno.find({})
        .skip(desde)
        .limit(hasta)
        .populate('materias', 'nombre')
        .populate('usuarios.id', 'nombre')
        .exec((err, alumnosDb) => {

            if (err) { return res.status(500).json({ ok: false, mensaje: err }) }

            res.json({
                ok: true,
                mensaje: 'Alumnos obtenidos correctamente',
                alumnos: alumnosDb
            })
        })
})


app.post('/alumno', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;

    let alumno = new Alumno({
            nombre: body.nombre,
            usuarios: []
        })
        ///////Aún no sé implantar un array

    alumno.usuarios.push(timeStamp);

    alumno.save((err, alumnoGuardado) => {

        if (err) {

            return res.status(500).json({ ok: false, err })
        }

        res.status(200).json({ ok: true, alumnoGuardado })
    })
})


app.put('./alumno/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Alumno.findById(id, (err, alumnoDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!alumnoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen alumnos con el el id introducido' })
        }

        alumnoDb.nombre = body.nombre;

        alumnoDb.save((err, alumnoGuardado) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, alumnoGuardado })
        })
    })
})


app.put('/alumnoAnadirMateria/:id', [verifyToken, timeStamp], (req, res) => {

    let id = req.params.id;
    let materiaId = req.body.materia;

    Alumno.findById(id, (err, alumnoDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!alumnoDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ningún alumno con el id introducido '
            })
        }

        alumnoDb.materias.push(materiaId)

        alumnoDb.save((err, alumnoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }

            actualizarMateria(res, alumnoGuardado, materiaId, 'alumno').then((materiaUpdated) => {

                res.status(200).json({ ok: true, alumnoGuardado, materiaActualizada: materiaUpdated.nombre })
            })
        })
    })
})



module.exports = app;