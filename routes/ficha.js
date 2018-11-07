const express = require('express');

const Ficha = require('../models/ficha');

const { updateProfesor, updateAlumno } = require('../pluggins/actualizarFicha');

const app = express();

app.get('/ficha', (req, res) => {

    let desde = req.query.desde;
    let hasta = req.query.hasta;

    Ficha.find({})
        .skip(desde)
        .limit(hasta)
        .exec((err, fichasDb) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            if (!fichasDb) {

                return res.status(404).json({ ok: false, mensaje: 'No se encontraron fichas en la base de datos' })
            }

            res.status(200).json({ ok: true, fichasDb })
        })
})


app.post('/ficha/:id', (req, res) => {

    let id = req.params.id;

    let body = req.body;

    let ficha = new Ficha({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        movil: body.movil,
        casa: body.casa,
        domicilio: body.domicilio
    })

    ficha.save((err, fichaSaved) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        Promise.all([
            updateProfesor(res, id, fichaSaved._id),
            updateAlumno(res, id, fichaSaved._id)
        ]).then(responses => {

            let profesor = responses[0];
            let alumno = responses[1];


            if (profesor === null) {

                alumno.save((err, alumnoActualizado) => {

                    if (err) {

                        return res.status(500).json({ ok: false, mensaje: err })

                    }

                    res.status(200).json({ ok: true, fichaSaved, alumnoActualizado: alumnoActualizado.nombre })
                })
            }

            if (alumno === null) {

                profesor.save((err, profesorActualizado) => {

                    if (err) {

                        return res.status(500).json({ ok: false, mensaje: err })

                    }

                    res.status(200).json({ ok: true, fichaSaved, profesorActualizado: profesorActualizado.nombre })
                })
            }
        })
    })
})


app.put('/ficha/:id', (req, res) => {

    let body = req.body;

    let id = req.params.id;

    Ficha.findById(id, (err, fichaDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!fichaDb) {

            return res.status(404).json({ ok: false, mensaje: `No se encontraron ficha con el id: ${id}` })
        }

        if (body.nombre) { fichaDb.nombre = body.nombre; }
        if (body.apellido) { fichaDb.apellido = body.apellido; }
        if (body.email) { fichaDb.email = body.email; }
        if (body.movil) { fichaDb.movil = body.movil; }
        if (body.casa) { fichaDb.casa = body.casa; }
        if (body.domicilio) { fichaDb.domicilio = body.domicilio; }


        fichaDb.save((err, fichaActualizada) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, fichaActualizada })

        })
    })
})


module.exports = app;