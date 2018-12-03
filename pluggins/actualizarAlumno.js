const Alumno = require('../models/alumno');

let actualizarAlumno = (res, materiaId, idAlumno) => {

    return new Promise((resolve, reject) => {

        Alumno.findById(idAlumno, (err, alumnoDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (!alumnoDb) {
                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron alumnos' }))
            }

            if (alumnoDb.materias.indexOf(materiaId) < 0) {

                alumnoDb.materias.push(materiaId)

                alumnoDb.save((err, alumnoActualizado) => {
                    if (err) {

                        reject(res.status(500).json({ ok: false, mensaje: err }))
                    }
                    resolve(alumnoActualizado)
                })

            } else {

                let alumno = alumnoDb

                alumno.materias = alumnoDb.materias.filter((materia) => { return JSON.stringify(materia) != JSON.stringify(materiaId); })

                alumno.save((err, alumnoActualizado) => {
                    if (err) {

                        reject(res.status(500).json({ ok: false, mensaje: err }))
                    }
                    resolve(alumnoActualizado)
                })
            }
        })
    })
}

module.exports = actualizarAlumno;