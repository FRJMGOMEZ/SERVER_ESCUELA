const express = require('express');

const Profesor = require('../models/profesor');
const Materia = require('../models/materia');
const Ficha = require('../models/ficha');


const timeStamp = require('../middlewares/timeStamp');
const { verifyToken, verifyRole } = require('../middlewares/auth');

const actualizarMateria = require('../pluggins/actualizarMateria');

const app = express();


app.get('/profesor', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    Profesor.find({})
        .populate('materias', 'nombre _id')
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

    profesor.save((err, profesorGuardado) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, profesorGuardado })

    })
})


app.put('/profesorAnadirMateria/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let id = req.params.id;
    let materiaId = req.body.materia;
    let timeStamp = req.body.timeStamp;

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

        if (profesorDb.materias.indexOf(materiaId) < 0) {

            profesorDb.materias.push(materiaId)
            profesorDb.usuarios.push(timeStamp)

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
        } else { res.status(403).json({ ok: false, mensaje: 'La materia ya ha sido asignada al profesor' }) }
    })
})


app.put('/profesor/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let id = req.params.id;
    let timeStamp = req.timeStamp;

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
        profesorDb.usuarios.push(timeStamp)

        profesorDb.save((err, profesorActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }

            res.status(200).json({ ok: true, profesorActualizado })
        })
    })
})


app.delete('/profesor/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Profesor.findByIdAndRemove(id, (err, profesorBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!profesorBorrado) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ningún profesor con el id introducido '
            })
        }

        let profesorBorradoId = profesorBorrado._id

        Materia.update({}, { $pull: { profesores: profesorBorradoId } })
            .exec((err, materiaActualizada) => {

                if (err) {

                    return res.status(500).json({ ok: false, mensaje: err })
                }

                let fichaId = profesorBorrado.ficha;

                Ficha.findByIdAndUpdate({ _id: fichaId }, { estado: false }, (err, fichaActualizada) => {

                    if (err) {

                        return res.status(500).json({ ok: false, mensaje: err })
                    }

                    res.status(200).json({ profesorBorrado, materiaActualizada, fichaActualizada })

                })
            })
    })
})


module.exports = app;