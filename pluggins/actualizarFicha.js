const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno');


let updateProfesor = (res, id, fichaId) => {

    return new Promise((resolve, reject) => {

        if (id) {

            Profesor.findById(id, (err, profesorDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (profesorDb) {

                    profesorDb.ficha = fichaId;
                    resolve(profesorDb)
                }

                resolve()

            })
        } else { resolve() }
    })
}


let updateAlumno = (res, id, fichaId) => {

    return new Promise((resolve, reject) => {

        if (id) {

            Alumno.findById(id, (err, alumnoDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!alumnoDb) {

                    resolve()

                } else {
                    alumnoDb.ficha = fichaId;
                    resolve(alumnoDb)
                }
            })
        } else { resolve() }
    })
}


module.exports = { updateProfesor, updateAlumno };