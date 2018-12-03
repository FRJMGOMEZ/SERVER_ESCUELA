const express = require('express');

const Materia = require('../models/materia');
const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno')

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const app = express();

const actualizarAlumno = require('../pluggins/actualizarAlumno');

const actualizarProfesor = require('../pluggins/actualizarProfesor');

app.get('/materia', (req, res) => {

    let desde = req.query.desde;

    desde = Number(desde)

    let limite = req.query.limite;

    limite = Number(limite)

    Materia.find({})
        .skip(desde)
        .limit(limite)
        .populate('usuarios.id', 'nombre')
        .populate('alumnos', 'nombre _id ficha')
        .populate('profesores', 'nombre _id')
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



app.put('/anadirOEliminarAlumno/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let id = req.params.id;
    let alumnoId = req.body.alumno;
    let timeStamp = req.body.timeStamp;

    Materia.findById(id, (err, materiaDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!materiaDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna materia con el id introducido '
            })
        }

        if (materiaDb.alumnos.indexOf(alumnoId) < 0) {

            materiaDb.alumnos.push(alumnoId)
            materiaDb.usuarios.push(timeStamp)

            materiaDb.save((err, materiaGuardada) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                }

                actualizarAlumno(res, materiaGuardada._id, alumnoId).then((alumnoActualizado) => {

                    res.status(200).json({ ok: true, materiaGuardada, alumnoActualizado: alumnoActualizado })
                })
            })
        } else {

            materiaDb.alumnos = materiaDb.alumnos.filter((alumno) => { return alumno != alumnoId })

            materiaDb.usuarios.push(timeStamp)

            materiaDb.save((err, materiaGuardada) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                }

                actualizarAlumno(res, materiaGuardada._id, alumnoId).then((alumnoActualizado) => {

                    res.status(200).json({ ok: true, materiaGuardada, alumnoActualizado: alumnoActualizado })
                })
            })
        }
    })
})

app.put('/anadirOEliminarProfesor/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let id = req.params.id;
    let profesorId = req.body.profesor;
    let timeStamp = req.body.timeStamp;

    Materia.findById(id, (err, materiaDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!materiaDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna materia con el id introducido '
            })
        }

        if (materiaDb.profesores.indexOf(profesorId) < 0) {

            materiaDb.profesores.push(profesorId)
            materiaDb.usuarios.push(timeStamp)

            materiaDb.save((err, materiaGuardada) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                }

                actualizarProfesor(res, materiaGuardada._id, profesorId).then((profesorActualizado) => {

                    res.status(200).json({ ok: true, materiaGuardada, profesorActualizado: profesorActualizado.nombre })
                })
            })
        } else {

            materiaDb.profesores = materiaDb.profesores.filter((profesor) => { return profesor != profesorId })

            materiaDb.usuarios.push(timeStamp)

            materiaDb.save((err, materiaGuardada) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: err
                    })
                }

                actualizarProfesor(res, materiaGuardada._id, profesorId).then((profesorActualizado) => {

                    res.status(200).json({ ok: true, materiaGuardada, profesorActualizado: profesorActualizado.nombre })
                })
            })
        }
    })
})

module.exports = app;