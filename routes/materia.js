const express = require('express');

const Materia = require('../models/materia');
const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno')

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


app.put('/materia/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {


    let id = req.params.id;
    let body = req.body;
    let timeStamp = req.timeStamp;

    Materia.findById(id, (err, materiaDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!materiaDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen materias con el id indicado' })
        }

        materiaDb.nombre = body.nombre;
        materiaDb.usuarios.push(timeStamp)

        materiaDb.save((err, materiaGuardada) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, materiaGuardada })
        })
    })

})


app.delete('/materia/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Materia.findByIdAndDelete(id, (err, materiaBorrada) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!materiaBorrada) {

            return res.status(404).json({ ok: false, mensaje: 'Materia no encontrada' })
        }

        let materiaBorradaId = materiaBorrada._id;

        Profesor.update({}, { $pull: { materias: materiaBorradaId } })
            .exec((err, profesorActualizado) => {

                if (err) {

                    return res.status(500).json({ ok: false, mensaje: err })
                }

                Alumno.update({}, { $pull: { materias: materiaBorradaId } })
                    .exec((err, alumnoActualizado) => {

                        if (err) {

                            return res.status(500).json({ ok: false, mensaje: err })
                        }

                        res.status(200).json({ profesorActualizado, alumnoActualizado, materiaBorrada })
                    })
            })
    })
})


module.exports = app;