const Profesor = require('../models/profesor');
const Alumno = require('../models/alumno');


let updateProfesor = (res, id, fichaId) => {

    return new Promise((resolve, reject) => {

        Profesor.findById(id, (err, profesorDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (profesorDb)

            {
                profesorDb.ficha = fichaId
            }

            resolve(profesorDb)

        })
    })
}


let updateAlumno = (res, id, fichaId) => {


    return new Promise((resolve, reject) => {

        Alumno.findById(id, (err, alumnoDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (alumnoDb) {

                alumnoDb.ficha = fichaId;
            }

            resolve(alumnoDb)

        })
    })
}


module.exports = { updateProfesor, updateAlumno };