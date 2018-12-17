const express = require('express');
const Alumno = require('../models/alumno');
const Usuario = require('../models/usuario');
const Profesor = require('../models/profesor');
const Materia = require('../models/materia');
const Ficha = require('../models/ficha');
const Proyecto = require('../models/proyecto');
const Calendario = require('../models/calendario');

///Ficha y proyecto por populate.
/// Materia y clase no hace falta hacer buscador. 

const app = express()

app.get('/search/:collection/:search', (req, res) => {

    let desde = req.query.desde;
    desde = Number(desde)
    let limite = req.query.limite || 10;
    limite = Number(limite)

    let collection = req.params.collection;
    let search = req.params.search;

    let regExp = new RegExp(search, "i");

    let promise;

    switch (collection) {
        case 'alumnos':
            promise = buscarAlumnos(res, regExp, desde, limite);
            break;
        case 'profesores':
            promise = buscarProfesores(res, regExp, desde, limite);
            break;
        case 'usuarios':
            promise = buscarUsuarios(res, regExp, desde, limite);
            break;
        case 'materias':
            promise = buscarMaterias(res, regExp), desde, limite;
            break;
        default:
            res.status(404).json({ ok: false, mensaje: 'No existe la colección requerida' });
            break;
    }

    promise.then((response) => {

        res.status(200).json({
            ok: true,
            [collection]: response
        })
    })
})


const buscarAlumnos = (res, regExp, desde, limite) => {

    return new Promise((resolve, reject) => {

        Alumno.find({ nombre: regExp })
            .skip(desde)
            .limit(limite)
            .populate('materias', 'nombre _id')
            .exec((err, alumnosDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!alumnosDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron alumnos con el nombre especificado' }))
                }

                resolve(alumnosDb)
            })
    })
}

const buscarProfesores = (res, regExp, desde, limite) => {

    return new Promise((resolve, reject) => {

        Profesor.find({ nombre: regExp })
            .skip(desde)
            .limit(limite)
            .populate('materias', 'nombre _id')
            .exec((err, profesoresDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!profesoresDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron profesores con el nombre especificado' }))
                }

                resolve(profesoresDb)
            })

    })


}
const buscarUsuarios = (res, regExp, desde, limite) => {

    return new Promise((resolve, reject) => {

        Usuario.find({ nombre: regExp }, (err, usuariosDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }

            if (!usuariosDb) {

                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron usuarios con el nombre especificado' }))
            }

            resolve(usuariosDb)
        })
    })
}

const buscarMaterias = (res, regExp, desde, limite) => {

    return new Promise((resolve, reject) => {

        Materia.find({ nombre: regExp })
            .skip(desde)
            .limit(limite)
            .populate('profesores', 'nombre _Id')
            .populate('alumnos', 'nombre _id')
            .exec((err, materiasDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!materiasDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron materias con el nombre especificado' }))
                }

                resolve(materiasDb)
            })
    })
}



app.get('/searchById/:collection/:id', (req, res) => {

    let collection = req.params.collection;
    let id = req.params.id;

    let promise;


    ////// Faltan las materias y clases 
    switch (collection) {
        case 'alumnos':
            promise = buscarAlumnoId(res, id);
            break;
        case 'profesores':
            promise = buscarProfesorId(res, id);
            break;
        case 'usuarios':
            promise = buscarUsuarioId(res, id);
            break;
        case 'fichas':
            promise = buscarFichaId(res, id);
            break;
        case 'proyecto':
            promise = buscarProyectoId(res, id);
            break;
        case 'materias':
            promise = buscarMateriaId(res, id);
            break;
        case 'calendario':
            promise = buscarCalendarioId(res, id);
            break;
        default:
            res.status(404).json({ ok: false, mensaje: 'No existe la colección requerida' });
            break;
    }

    promise.then((response) => {

        res.status(200).json({
            [collection]: response
        })
    })
})

const buscarAlumnoId = (res, id) => {

    return new Promise((resolve, reject) => {

        Alumno.findById(id)
            .populate('materias', 'nombre')
            .exec((err, alumnoDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!alumnoDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron alumnos con el id especificado' }))
                }

                resolve(alumnoDb)
            })
    })
}

const buscarProfesorId = (res, id) => {

    return new Promise((resolve, reject) => {

        Profesor.findById(id, (err, profesorDb) => {

            if (err) {

                reject(res.status(500).json({ ok: false, mensaje: err }))
            }


            if (!profesorDb) {

                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron profesores con el id especificado' }))
            }

            resolve(profesorDb)
        })

    })


}
const buscarUsuarioId = (res, id) => {

    return new Promise((resolve, reject) => {

        Usuario.findById(id)
            .populate('proyectos', 'nombre _id descripcion img activo')
            .exec((err, usuarioDb) => {

                if (err) {

                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }

                if (!usuarioDb) {

                    reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron usuarios con el id especificado' }))
                }

                resolve(usuarioDb)
            })
    })
}

const buscarFichaId = (res, id) => {

    return new Promise((resolve, reject) => {

        Ficha.findById(id, (err, fichaDb) => {

            if (err) {
                reject(res.status(500).json({ ok: false, mensaje: err }))
            }
            if (!fichaDb) {
                reject(res.status(404).json({ ok: false, mensaje: 'No se encontraron fichas con el id especificado' }))
            }

            resolve(fichaDb)

        })
    })
}


const buscarMateriaId = (res, id) => {

    return new Promise((resolve, reject) => {

        Materia.findById(id)
            .exec((err, materiaDb) => {

                if (err) {
                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }
                if (!materiaDb) {
                    reject(res.status(404).json({ ok: false, mensaje: 'No existe ninguna materia con el id especificado' }))
                }
                resolve(materiaDb)
            })
    })
}


const buscarProyectoId = (res, id) => {

    return new Promise((resolve, reject) => {

        Proyecto.findById(id)
            .populate('participantes', 'nombre _id')
            .populate('administradores', 'nombre _id')
            .exec((err, proyectoDb) => {

                if (err) {
                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }
                if (!proyectoDb) {
                    reject(res.status(404).json({ ok: false, mensaje: 'No existe ningun proyecto con el id especificado' }))
                }
                resolve(proyectoDb)
            })
    })
}

const buscarCalendarioId = (res, id) => {

    return new Promise((resolve, reject) => {

        Calendario.findById(id, (err, calendarioDb) => {

            if (err) {
                reject(res.status(500).json({ ok: false, mensaje: err }))
            }
            if (!calendarioDb) {
                reject(res.status(404).json({ ok: false, mensaje: 'No existe ningun calendario con el id especificado' }))
            }
            resolve(calendarioDb)
        })
    })
}



module.exports = app;