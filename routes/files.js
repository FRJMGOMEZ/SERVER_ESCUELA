const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const FileModel = require('../models/file');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.use(fileUpload());

app.get('/files/:type/:fileName', (req, res, next) => {

    let type = req.params.type;
    let fileName = req.params.fileName;

    if (type === 'icons') {

        let pathImage = path.resolve(__dirname, `../assets/${type}/${fileName}`);
        if (fs.existsSync(pathImage)) {
            res.sendFile(pathImage)
        } else {
            let pathNoImage = path.resolve(__dirname, '../assets/no-image.png');
            res.sendFile(pathNoImage)
        }
    } else {
        let pathImage = path.resolve(__dirname, `../uploads/${type}/${fileName}`);
        if (fs.existsSync(pathImage)) {
            res.sendFile(pathImage)
        } else {
            let pathNoImage = path.resolve(__dirname, '../assets/no-image.png');
            res.sendFile(pathNoImage)
        }
    }
})

app.put('/upload/:type/:id/:download', (req, res) => {
    let type = req.params.type;
    let id = req.params.id;
    let file = req.files.file;
    if (!file) {
        return res.status(400).json({
            ok: false,
            message: 'No images have been selected'
        });
    }
    recordFile(res, type, file, id).then((response) => {
        let newFile = new FileModel({ name: response.fileName, title: file.name, download: req.params.download, format: response.extension, type: type })
        newFile.save((err, file) => {
            if (err) {
                deleteFile(fileName, type)
                return res.status(500).json({
                    ok: false,
                    error
                })
            }
            if (type === '!projectFiles') {
                request.exec((error, itemUpdated) => {
                    if (err) {
                        deleteFile(fileName, type)
                        File.findByIdAndDelete(file._id, (err, file) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    error
                                })
                            }
                            return res.status(500).json({
                                ok: false,
                                error
                            })
                        })
                    }
                    if (!itemUpdated) {
                        deleteFile(fileName, type)
                        File.findByIdAndDelete(file._id, (err, file) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    error
                                })
                            }
                            return res.status(400).json({
                                ok: false,
                                message: `There are no ${type} with the ID provided`
                            })
                        })
                    }
                    res.status(200).json({ file })
                })
            } else {
                res.status(200).json({ file })
            }
        })
    })
});


const recordFile = (res, type, file, id) => {
    return new Promise((resolve, reject) => {
        let validTypes = ['users', 'alumnis', 'professors', 'projects', 'projectFiles'];
        if (validTypes.indexOf(type) < 0) {
            return res.status(403).json({
                ok: false,
                message: `Invalid type, the valids ones are: ${validTypes.join(', ')}`
            })
        }
        let validExtensions = ['png', 'jpg', 'gif', 'jpeg', 'pdf', 'JPG'];
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
            resolve({ fileName, extension })
        })
    })
}

app.delete('/deleteFile/:fileId/:type', [verifyToken, verifyRole], async(req, res) => {
    let type = req.params.type;
    let fileId = req.params.fileId;

    FileModel.findByIdAndDelete(fileId, (err, fileDeleted) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        if (!fileDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no files with the ID provided' })
        }
        deleteFile(fileDeleted.name, type)
        res.status(200).json({ ok: true, file: fileDeleted })
    })
})

const deleteFile = (fileName, type) => {
    let pathImage = path.resolve(__dirname, `../../SERVER/uploads/${type}/${fileName}`);
    if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage);
    }
};


module.exports = app;