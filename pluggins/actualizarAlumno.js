const Alumno = require('../models/alumno');

let actualizarAlumno = (res, materiaId, idAlumno) => {

    return new Promise((resolve, reject) => {

        Alumno.findById(idAlumno, (err, alumnoDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (alumnoDb === null) {
                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron alumnos' }))
            }
            if (alumnoDb.materias.indexOf(materiaId) < 0) {

                alumnoDb.materias.push(materiaId)
            } else {

                alumnoDb.materias = alumnoDb.materias.filter((materia) => { materia != materiaId })
            }

            alumnoDb.save((err, alumnoActualizado) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                resolve(alumnoActualizado)
            })
        })
    })
}

module.exports = actualizarAlumno;