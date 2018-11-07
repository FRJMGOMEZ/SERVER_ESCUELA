const Materia = require('../models/materia');

let actualizarMateria = (res, individuo, idMateria, tipo) => {

    return new Promise((resolve, reject) => {

        Materia.findById(idMateria, (err, materiaDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (!materiaDb) {
                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron Materias' }))
            }


            if (tipo === 'alumno') {

                materiaDb.alumnos.push(individuo._id)
            }

            if (tipo === 'profesor') {

                materiaDb.profesores.push(individuo._id)
            }

            materiaDb.save((err, materiaUpdated) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                resolve(materiaUpdated)
            })
        })
    })
}

module.exports = actualizarMateria;