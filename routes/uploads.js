const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Alumni = require('../models/alumni');
const Professor = require('../models/professor');
const Project = require('../models/project');

const fs = require('fs');
const path = require('path');

const { verifyToken, verifyRole } = require('../middlewares/auth');

app.use(fileUpload());

app.put('/upload/:type/:id', (req, res) => {

    let type = req.params.type;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No images have been selected'
        });
    }
    let validTypes = ['users', 'alumnis', 'professors', 'projects', 'imagesProject', 'filesProject', 'files'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(403).json({
            ok: false,
            message: `Invalid type, the valids ones are: ${validTypes.join(', ')}`
        })
    }
    let file = req.files.file;
    let validExtensions = ['png', 'jpg', 'gif', 'jpeg', 'pdf'];
    let cuttedFile = file.name.split('.');
    let extension = cuttedFile[cuttedFile.length - 1];
    if (validExtensions.indexOf(extension) < 0) {
        return res.status(403).json({
            ok: false,
            message: `The extension of the file is not allowed, the allowed ones are:${validExtensions.join(', ')}`
        })
    }
    let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
    file.mv(`uploads/${type}/${fileName}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        switch (type) {
            case 'users':
                userImage(id, res, fileName);
                break;
            case 'alumnis':
                alumniImage(id, res, fileName);
                break;
            case 'professors':
                professorImage(id, res, fileName);
                break;
            case 'projects':
                projectImage(id, res, fileName);
                break;
            case 'imagesProject':
                messageImage(id, res, fileName);
                break;
            case 'filesProject':
                messageFile(id, res, fileName);
                break;
            case 'files':
                files(id, res, fileName);
                break;
        }
    })
});


const userImage = (id, res, fileName) => {

    User.findById(id, (err, userDb) => {
        if (err) {
            deleteFile(fileName, 'users')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!userDb) {
            deleteFile(fileName, 'users')
            return res.status(400).json({
                ok: false,
                message: 'There are no users with the ID provided'
            })
        }
        deleteFile(userDb.img, 'users');
        userDb.img = fileName;
        userDb.save((err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error
                })
            }
            res.json({
                ok: true,
                user
            })
        })
    })
}

const alumniImage = (id, res, fileName) => {

    Alumni.findById(id, (err, alumniDb) => {
        if (err) {
            deleteFile(fileName, 'alumnis')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!alumniDb) {
            deleteFile(fileName, 'alumnis')
            return res.status(400).json({
                ok: false,
                message: 'There are no alumnis with the ID provided'
            })
        }
        deleteFile(alumniDb.img, 'alumnis');
        Alumni.findByIdAndUpdate(id, { img: fileName })
            .exec((err, alumni) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error
                    })
                }
                res.json({
                    ok: true,
                    alumni
                })
            })
    })
}


const professorImage = (id, res, fileName) => {

    Professor.findById(id, (err, professorDb) => {
        if (err) {
            deleteFile(fileName, 'professors')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!professorDb) {
            deleteFile(fileName, 'professors')
            return res.status(400).json({
                ok: false,
                message: 'There are no professors with the ID provided'
            })
        }
        deleteFile(professorDb.img, 'professors')
        Professor.findByIdAndUpdate(id, { img: fileName })
            .exec((err, professor) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error
                    })
                }
                res.json({
                    ok: true,
                    professor
                })
            })
    })
}


const projectImage = (id, res, fileName) => {
    Project.findById(id, (err, projectDb) => {
        if (err) {
            deleteFile(fileName, 'projects')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!projectDb) {
            deleteFile(fileName, 'projects')
            return res.status(400).json({
                ok: false,
                message: 'There are no projects with the ID provided'
            })
        }
        deleteFile(projectDb.img, 'projects');
        Project.findByIdAndUpdate(id, { img: fileName })
            .exec((error, project) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error
                    })
                }
                res.json({
                    ok: true,
                    project
                })
            })
    })
}

const messageImage = (id, res, fileName) => {

    Project.findById(id, (err, projectDb) => {
        if (err) {
            deleteFile(fileName, 'imagesProject')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!projectDb) {
            deleteFile(fileName, 'imagesProject')
            return res.status(400).json({
                ok: false,
                message: 'There are no projects with the ID provided'
            })
        }
        Project.update({ id }, { $push: { images: fileName } })
            .exec((err) => {
                if (err, message) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                res.json({
                    ok: true,
                    project
                })
            })
    })
}

const messageFile = (id, res, fileName) => {

    Project.findById(id, (err, projectDb) => {
        if (err) {
            deleteFile(fileName, 'filesProject')
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if (!projectDb) {
            deleteFile(fileName, 'filesProject')
            return res.status(400).json({
                ok: false,
                message: 'There are no projects with the ID provided'
            })
        }
        Project.update({ id }, { $push: { files: fileName } })
            .exec((err) => {
                if (err, project) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                res.json({
                    ok: true,
                    project

                })
            })
    })
}

const files = (id, res, fileName) => {

    Project.findById(id, (err, projectDb) => {
        if (err) {
            deleteFile(fileName, 'files')
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!projectDb) {
            deleteFile(fileName, 'files')
            return res.status(400).json({
                ok: false,
                message: 'There are no projects with the ID provided'
            })
        }
        ///////////////////////////////////Include contracts//////////////////////////////////
        proyectDb.archivos.push(fileName);
        proyectDb.save((error, project) => {
            res.json({
                project
            })
        })
    })
}


const deleteFile = (fileName, type) => {

    let pathImage = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);

    if (fs.existsSync(pathImage)) { fs.unlinkSync(pathImage) }
};


module.exports = app;