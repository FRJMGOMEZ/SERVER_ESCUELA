const Profesor = require('../models/profesor');

let actualizarProfesor = (res, materiaId, idProfesor) => {

    return new Promise((resolve, reject) => {

        Profesor.findById(idProfesor, (err, profesorDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (!profesorDb) {
                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron profesores' }))
            }

            if (profesorDb.materias.indexOf(materiaId) < 0) {

                profesorDb.materias.push(materiaId)
            } else {

                profesorDb.materias = profesorDb.materias.filter((materias) => { return materias != materiaId })
            }

            profesorDb.save((err, alumnoActualizado) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                resolve(alumnoActualizado)
            })
        })
    })
}

module.exports = actualizarProfesor;