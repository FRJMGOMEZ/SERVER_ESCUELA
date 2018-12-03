const Usuario = require('../models/usuario');


let actualizarParticipantes = (res, id, proyectoId) => {

    return new Promise((resolve, reject) => {

        Usuario.findById(id, (err, usuarioDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (!usuarioDb) {

                reject(res.status(404).json({ ok: false, mensaje: 'No existen usuarios con el id introducido' }))
            }

            console.log(usuarioDb)

            usuarioDb.proyectos.push(proyectoId)

            usuarioDb.save((err, usuarioGuardado) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                resolve(usuarioGuardado.nombre)
            })

        })
    })
}

module.exports = { actualizarParticipantes }