const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Alumno = require('../models/alumno');
const Profesor = require('../models/profesor');
const Proyecto = require('../models/proyecto');

const fs = require('fs');
const path = require('path');

const { verifyToken, verifyRole } = require('../middlewares/auth');


app.use(fileUpload());


app.put('/uploadImg/:type/:id', (req, res) => {

    let type = req.params.type;
    let id = req.params.id;

    if (!req.files)
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ninguna imagen'
        });

    ////VALIDAMOS EL TIPO DE ARCHIVO////
    let validTypes = ['usuarios', 'alumnos', 'profesores', 'proyectos', 'imgProyectos'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(403).json({
            ok: false,
            message: `Tipo de registro inválido, los tipos válidos son: ${validTypes.join(', ')}`
        })
    }

    ////VALIDAMOS LA EXTENSION DEL ARCHIVO///
    let file = req.files.img;

    let validExtensions = ['png', 'jpg', 'gif', 'jpeg', 'pdf'];

    let cuttedFile = file.name.split('.');

    let extension = cuttedFile[cuttedFile.length - 1];

    if (validExtensions.indexOf(extension) < 0) {
        return res.status(403).json({
            ok: false,
            message: `La extensión del archivo no es permitida, las extensiones permitidas son :${extensionesValidas.join(', ')}`
        })
    }

    //////NOW, WE SAVE AND UPDATE THE IMAGE OF THE DATABASE////////
    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;


    file.mv(`uploads/${type}/${fileName}`, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                message: 'El archivo no ha podido ser guardado'
            });

        switch (type) {
            case 'usuarios':
                imagenUsuario(id, res, fileName);
                break;
            case 'alumnos':
                imagenAlumno(id, res, fileName);
                break;
            case 'profesores':
                imagenProfesor(id, res, fileName);
                break;
            case 'proyectos':
                imagenProyecto(id, res, fileName);
                break;
            case 'imgProyectos':
                imagenMensajeProyecto(id, res, fileName);
                break;
        }
    })
});


const imagenUsuario = (id, res, fileName) => {

    Usuario.findById(id, (error, usuarioDb) => {

        if (error) {

            deleteFile(fileName, 'usuarios')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }

        if (!usuarioDb) {

            deleteFile(fileName, 'usuarios')

            return res.status(400).json({
                ok: false,
                message: 'El usuario no existe'
            })
        }

        deleteFile(usuarioDb.img, 'usuarios');

        usuarioDb.img = fileName;

        usuarioDb.save((error, usuarioActualizado) => {

            res.json({
                ok: true,
                usuarioActualizado
            })
        })
    })
}

const imagenAlumno = (id, res, fileName) => {

    Alumno.findById(id, (error, alumnoDb) => {

        if (error) {

            deleteFile(fileName, 'alumnos')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }
        if (!alumnoDb) {

            deleteFile(fileName, 'alumnos')

            return res.status(400).json({
                ok: false,
                message: 'El alumno no existe'
            })
        }
        deleteFile(alumnoDb.img, 'alumnos');

        alumnoDb.img = fileName;

        alumnoDb.save((error, alumnoActualizado) => {

            res.json({
                ok: true,
                alumnoActualizado
            })
        })
    })
}


const imagenProfesor = (id, res, fileName) => {

    Profesor.findById(id, (error, profesorDb) => {

        if (error) {

            deleteFile(fileName, 'profesores')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }
        if (!profesorDb) {

            deleteFile(fileName, 'profesores')

            return res.status(400).json({
                ok: false,
                message: 'El profesor no existe'
            })
        }
        deleteFile(profesorDb.img, 'profesores');

        profesorDb.img = fileName;

        profesorDb.save((error, profesorActualizado) => {

            res.json({
                ok: true,
                profesorActualizado
            })
        })
    })
}


const imagenProyecto = (id, res, fileName) => {

    Proyecto.findById(id, (error, proyectoDb) => {

        if (error) {

            deleteFile(fileName, 'proyectos')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }
        if (!proyectoDb) {

            deleteFile(fileName, 'proyectos')

            return res.status(400).json({
                ok: false,
                message: 'El proyecto no existe'
            })
        }

        deleteFile(proyectoDb.img, 'proyectos');

        proyectoDb.img = fileName;

        proyectoDb.save((error, proyectoActualizado) => {

            res.json({
                ok: true,
                proyectoActualizado
            })
        })
    })
}


const imagenMensajeProyecto = (id, res, fileName) => {

    Proyecto.findById(id, (error, proyectoDb) => {

        if (error) {

            deleteFile(fileName, 'imgProyectos')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }
        if (!proyectoDb) {

            deleteFile(fileName, 'imgProyectos')

            return res.status(400).json({
                ok: false,
                message: 'El proyecto no existe'
            })
        }
        proyectoDb.imagenes.push(fileName);

        proyectoDb.save((error, proyectoActualizado) => {

            res.json({
                fileName
            })
        })
    })
}



app.put('/uploadFile/:type/:id', (req, res) => {

    let type = req.params.type;
    let id = req.params.id;

    if (!req.files)
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ningún archivo'
        });

    ////VALIDAMOS EL TIPO DE ARCHIVO////
    let validTypes = ['files'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(403).json({
            ok: false,
            message: `Tipo de registro inválido, los tipos válidos son: ${validTypes.join(', ')}`
        })
    }

    ////VALIDAMOS LA EXTENSION DEL ARCHIVO///
    let file = req.files.files;

    let validExtensions = ['pdf', 'txt', 'doc', 'odt'];

    let cuttedFile = file.name.split('.');

    let extension = cuttedFile[cuttedFile.length - 1];

    if (validExtensions.indexOf(extension) < 0) {
        return res.status(403).json({
            ok: false,
            message: `La extensión del archivo no es permitida, las extensiones permitidas son :${extensionesValidas.join(', ')}`
        })
    }
    //////NOW, WE SAVE AND UPDATE THE IMAGE OF THE DATABASE////////
    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;


    file.mv(`uploads/${type}/${fileName}`, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                message: 'El archivo no ha podido ser guardado'
            });

        fileProyectos(id, res, fileName)
    })
});


const fileProyectos = (id, res, fileName) => {

    Proyecto.findById(id, (error, proyectoDb) => {

        if (error) {

            deleteFile(fileName, 'files')

            return res.status(500).json({
                ok: false,
                message: error
            })
        }
        if (!proyectoDb) {

            deleteFile(fileName, 'files')

            return res.status(400).json({
                ok: false,
                message: 'El proyecto no existe'
            })
        }
        proyectoDb.archivos.push(fileName);

        proyectoDb.save((error, proyectoActualizado) => {

            res.json({
                fileName
            })
        })
    })
}


const deleteFile = (fileName, type) => {

    let pathImage = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);

    if (fs.existsSync(pathImage)) { fs.unlinkSync(pathImage) }
};


module.exports = app;