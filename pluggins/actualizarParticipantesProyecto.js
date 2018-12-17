const Usuario = require('../models/usuario');


let actualizarParticipantes = (res, id, proyectoId) => {

    return new Promise((resolve, reject) => {

        Usuario.findById(id)
            .exec((err, usuarioDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!usuarioDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No existen usuarios con el id introducido' }))
                }

                if (usuarioDb.proyectos.indexOf(proyectoId) < 0) {

                    usuarioDb.proyectos.push(proyectoId)
                } else {

                    usuarioDb.proyectos = usuarioDb.proyectos.filter((proyecto) => { return JSON.stringify(proyecto) != JSON.stringify(proyectoId) })
                }

                usuarioDb.save((err, usuarioGuardado) => {

                    if (err) {

                        reject(res.status(500).json({ ok: false, mensaje: err }))
                    }

                    resolve(usuarioGuardado)
                })

            })
    })
}



module.exports = { actualizarParticipantes }