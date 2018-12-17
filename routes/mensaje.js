const express = require('express');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const Proyecto = require('../models/proyecto');
const Mensaje = require('../models/mensaje');

const app = express()


app.get('/mensajes/:id', verifyToken, (req, res) => {

    let proyectoId = req.params.id;

    Mensaje.find()
        .skip(0)
        .limit(15)
        .populate('usuario', 'nombre _id')
        .exec((err, mensajesDb) => {

            if (err) {
                res.status(500).json({ ok: false, mensaje: err })
            }

            if (!mensajesDb) {

                res.status(404).json({ ok: false, mensaje: 'No se encontraron mensajes' })
            }

            let mensajes = []

            for (let mensaje of mensajesDb) {

                if (JSON.stringify(mensaje.proyecto) === JSON.stringify(proyectoId)) {

                    mensajes.push(mensaje)
                }
            }

            res.status(200).json({ ok: true, mensajes })
        })
})


app.post('/mensaje', verifyToken, (req, res) => {

    let mensaje = new Mensaje({
        usuario: req.body.usuario,
        proyecto: req.body.proyecto,
        mensaje: req.body.mensaje,
        img: req.body.img,
        file: req.body.file,
        titulo: req.body.titulo
    })

    mensaje.save((err, mensajeGuardado) => {

        if (err) {
            res.status(500).json({ ok: false, mensaje: err })
        }

        Proyecto.findById(req.body.proyecto, (err, proyectoDb) => {

            if (err) {
                res.status(500).json({ ok: false, mensaje: err })
            }

            if (!proyectoDb) {

                res.status(404).json({ ok: false, mensaje: 'No se encontró ningún proyecto con el id especificado' })
            }

            proyectoDb.mensajes.push(mensajeGuardado._id)

            proyectoDb.save((err, proyectoGuardado) => {

                if (err) {
                    res.status(500).json({ ok: false, mensaje: err })
                }

                res.status(200).json({ ok: true, mensajeGuardado, proyectoGuardado })
            })
        })
    })
})

module.exports = app;