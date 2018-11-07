const express = require('express');

const Proyecto = require('../models/proyecto');
const Usuario = require('../models/usuario');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const { actualizarParticipantes } = require('../pluggins/actualizarParticipantesProyecto');

const app = express();

app.get('/proyecto', (req, res) => {

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

    let proyecto = new Proyecto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuarios: []
    })

    proyecto.usuarios.push(timeStamp)

    proyecto.save((err, proyectoGuardado) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        res.status(200).json({ ok: true, proyectoGuardado })
    })

})


app.put('/anadirParticipante/:id', (req, res) => {

    let participanteId = req.body.participante;
    let id = req.params.id;

    Proyecto.findById(id, (err, proyectoDb) => {


        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }

        proyectoDb.participantes.push(participanteId)

        proyectoDb.save((err, proyectoGuardado) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            actualizarParticipantes(res, participanteId, proyectoGuardado._id).then(nombreUsuarioActualizado => {

                res.status(200).json({ ok: true, proyectoGuardado, usuarioActualizado: nombreUsuarioActualizado })

            })
        })
    })
})

app.put('/proyecto/:id', (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Proyecto.findById(id, (err, proyectoDb) => {

        if (err) {

            return res.status(500).json({ ok: false, mensaje: err })
        }

        if (!proyectoDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existen proyectos con el id introducido' })
        }
        proyectoDb.nombre = body.nombre;
        proyectoDb.descripcion = body.descripcion;

        proyectoDb.save((err, proyectoActualizado) => {
            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, proyectoActualizado })
        })
    })
})


app.delete('/proyecto/:id', (req, res) => {

    let id = req.params.id;

    Proyecto.findByIdAndRemove(id, (err, proyectoBorrado) => {

        borrarProyectoEnParticipante(proyectoBorrado._id, proyectoBorrado.participantes).then(nombresUsuariosActualizados => {

            res.status(200).json({ nombresUsuariosActualizados })

        })
    })
})

let borrarProyectoEnParticipante = (idProyecto, participantes) => {

    return new Promise((resolve, reject) => {

        let usuariosActualizados = [];

        for (let participanteId of participantes) {

            Usuario.findById(participanteId, (err, usuarioDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!usuarioActualizado) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No existen usuarios con el id introducido' }))
                }

                usuarioDb.proyectos = usuarioDb.proyectos.filter((proyecto) => { return proyecto != idProyecto })

                res.json({ usuarios: usuarioDb.proyectos })

                usuarioDb.save((err, usuarioActualizado) => {

                    if (err) {

                        reject(res.status(500).json({ ok: false, mensaje: err }))
                    }

                    usuariosActualizados.push(usuarioActualizado.nombre)

                })

            })
        }

        resolve(usuariosActualizados)
    })

}


module.exports = app;