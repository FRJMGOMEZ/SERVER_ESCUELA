const express = require('express');

const Clase = require('../models/clase');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const app = express()


app.get('/clase', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Clase.find({})
        .skip(desde)
        .limit(limite)
        .populate('usuarios.id', 'nombre')
        .exec((err, clasesDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: err
                })
            }
            if (!clasesDb) {

                return res.status(404).json({
                    ok: false,
                    mensaje: 'No existen clases en la base de datos'
                })
            }
            res.status(200).json({
                ok: true,
                clasesDb
            })
        })
})


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


app.put('/cambiarDisponibilidad/:id', [verifyToken, timeStamp], (req, res) => {

    let timeStamp = req.timeStamp;
    let id = req.params.id;

    Clase.findById(id, (err, claseDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!claseDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna clase con el id introducido'
            })
        }

        if (claseDb.disponible === true) {
            claseDb.materia.profesor = undefined;
            claseDb.materia.materia = undefined;
            claseDb.ocupada = false;
            claseDb.disponible = false;
            claseDb.usuarios.push(timeStamp)
        } else {
            claseDb.disponible = true;
            claseDb.usuarios.push(timeStamp)
        }

        claseDb.save((err, claseActualizada) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }
            res.status(200).json({ ok: true, claseActualizada })
        })
    })
})

app.put('/cambiarOcupacion/:id', [verifyToken, timeStamp], (req, res) => {

    let materia = req.body.materia;
    let profesor = req.body.profesor;
    let id = req.params.id;
    let timeStamp = req.timeStamp;

    Clase.findById(id, (err, claseDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!claseDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna clase con el id introducido'
            })
        }

        if (claseDb.disponible === false) {

            return res.status(403).json({ ok: false, mensaje: 'La clase no está disponible.' })
        }

        if (claseDb.ocupada === true) {

            if (materia && profesor) {

                claseDb.materia.profesor = profesor;
                claseDb.materia.materia = materia;
                claseDb.usuarios.push(timeStamp)
            } else {
                claseDb.ocupada = false;
                claseDb.usuarios.push(timeStamp)
            }
        } else {

            if (materia && profesor) {
                claseDb.ocupada = true;
                claseDb.materia.profesor = profesor;
                claseDb.materia.materia = materia;
                claseDb.usuarios.push(timeStamp)
            }
        }
        claseDb.save((err, claseActualizada) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }
            res.status(200).json({ ok: true, claseActualizada })
        })
    })
})

app.put('/clase/:id', [verifyToken, timeStamp], (req, res) => {

    let timeStamp = req.timeStamp;
    let id = req.params.id;
    let body = req.body;

    Clase.findById(id, (err, claseDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!claseDb) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna clase con el id introducido'
            })
        }

        if (!body.nombre) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Debes introducir un nuevo nombre '
            })
        } else {
            claseDb.nombre = body.nombre;
            claseDb.usuarios.push(timeStamp)
        }

        claseDb.save((err, claseActualizada) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }
            res.status(200).json({ ok: true, claseActualizada })
        })
    })
})


app.delete('/clase/:id', (req, res) => {

    let id = req.params.id;

    Clase.findByIdAndRemove(id, (err, claseBorrada) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!claseBorrada) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existe ninguna clase con el id introducido'
            })
        }

        res.status(200).json({ ok: true, claseBorrada })

    })


})



module.exports = app;