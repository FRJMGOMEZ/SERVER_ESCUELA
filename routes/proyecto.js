const express = require('express');

const Proyecto = require('../models/proyecto');
const Usuario = require('../models/usuario');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const { actualizarParticipantes } = require('../pluggins/actualizarParticipantesProyecto');

const app = express();

app.get('/proyecto', verifyToken, (req, res) => {

    let desde = req.query.desde;
    let hasta = req.query.hasta;

    Proyecto.find({})
        .skip(desde)
        .limit(hasta)
        .populate('participantes', 'nombre')
        .exec((err, proyectosDb) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            if (!proyectosDb) {

                return res.status(404).json({ ok: false, mensaje: 'No existen proyectos en la base de datos' })
            }
            res.status(200).json({ ok: true, proyectosDb })

        })
})


app.post('/proyecto', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;
    let usuarioOnline = req.usuario.usuarioDb

    let proyecto = new Proyecto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuarios: []
    })

    proyecto.participantes.push(usuarioOnline._id)
    proyecto.administradores.push(usuarioOnline._id)

    proyecto.usuarios.push(timeStamp)

    proyecto.save((err, proyectoGuardado) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        actualizarParticipantes(res, usuarioOnline._id, proyectoGuardado._id).then(usuarioActualizado => {

            res.status(200).json({ ok: true, proyectoGuardado, usuarioActualizado })
        })
    })

})


app.put('/anadirOExpulsarParticipante/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let participanteId = req.body.participante;
    let id = req.params.id;
    let timeStamp = req.timeStamp;

    Proyecto.findById(id, (err, proyectoDb) => {


        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }

        if (proyectoDb['participantes'].indexOf(participanteId) < 0) {

            proyectoDb.participantes.push(participanteId)
        } else {

            proyectoDb.participantes = proyectoDb.participantes.filter((participante) => { return participante != participanteId })
        }

        proyectoDb.usuarios.push(timeStamp)

        proyectoDb.save((err, proyectoGuardado) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            actualizarParticipantes(res, participanteId, proyectoGuardado._id).then(usuarioActualizado => {

                res.status(200).json({ ok: true, proyectoGuardado, usuarioActualizado })

            })
        })
    })
})

app.put('/proyecto/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let id = req.params.id;
    let timeStamp = req.timeStamp;

    Proyecto.findById(id, (err, proyectoDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }
        proyectoDb.nombre = body.nombre;
        proyectoDb.descripcion = body.descripcion;
        proyectoDb.usuarios.push(timeStamp)

        proyectoDb.save((err, proyectoActualizado) => {
            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, proyectoActualizado })
        })
    })
})

app.put('/anadirEliminarAdmin/:id', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let participanteId = req.body.participante;
    let id = req.params.id;

    Proyecto.findById(id, (err, proyectoDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }


        if (proyectoDb.administradores.indexOf(participanteId) < 0) {

            proyectoDb.administradores.push(participanteId)
        } else {

            proyectoDb.administradores = proyectoDb.administradores.filter((admnistrador) => { return JSON.stringify(admnistrador) != JSON.stringify(participanteId) })
        }

        proyectoDb.save((err, proyectoGuardado) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, proyectoGuardado })
        })
    })
})


app.put('/proyecto/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;
    let timeStamp = req.timeStamp;

    Proyecto.findById(id, (err, proyectoDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }
        proyectoDb.nombre = body.nombre;
        proyectoDb.descripcion = body.descripcion;
        proyectoDb.usuarios.push(timeStamp)

        proyectoDb.save((err, proyectoActualizado) => {
            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, proyectoActualizado })
        })
    })
})

app.put('/cambiarEstado/:id', (req, res) => {

    let id = req.params.id;

    Proyecto.findById(id, (err, proyectoDb) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }

        if (proyectoDb.activo === true) {

            proyectoDb.activo = false
        } else {

            proyectoDb.activo = true
        }

        proyectoDb.save((err, proyectoGuardado) => {

            if (err) {

                res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, proyectoGuardado })
        })
    })
})


module.exports = app;