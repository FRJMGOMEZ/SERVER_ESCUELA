const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const FileModel = require('../models/file');
const AWS = require('aws-sdk');
const User = require('../models/user');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

let validExtensions = ['png', 'jpg', 'gif', 'jpeg', 'pdf', 'JPG'];

app.use(fileUpload());

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const s3 = new AWS.S3();

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
    } else if (type === 'front') {
        let pathImage = path.resolve(__dirname, `../assets/cargoImages/${fileName}`);
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
    let newFile;
    recordFile(res, type, file, id).then(async(response) => {
        newFile = await new FileModel({ name: response.fileName, title: file.name, download: req.params.download, format: response.extension, type: type })
        let location;
        if (response.data) {
            console.log(response.data.Location)
            location = response.data.Location;
        } else {
            location = path.resolve(__dirname, `../../SERVER/uploads/${type}/${response.fileName}`);
        }
        newFile.location = location;
        newFile.save((err, file) => {
            if (err) {
                deleteFile(file.location, file.name, res).then(() => {
                    return res.status(500).json({
                        ok: false,
                        error
                    })
                })
            }
            if (type != 'Project') {
                let request;
                switch (type) {
                    case 'User':
                        request = User.findByIdAndUpdate(id, { img: file._id });
                        break;
                }
                request.exec((error, itemUpdated) => {
                    if (err) {
                        deleteFile(file.location, file.name, res).then(() => {
                            FileModel.findByIdAndDelete(file._id, (err, file) => {
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
                        })
                    }
                    if (!itemUpdated) {
                        deleteFile(file.location, file.name, res).then(() => {
                            FileModel.findByIdAndDelete(file._id, (err, file) => {
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
        let validTypes = ['User', 'Project'];
        if (validTypes.indexOf(type) < 0) {
            return res.status(403).json({
                ok: false,
                message: `Invalid type, the valids ones are: ${validTypes.join(', ')}`
            })
        }
        let cuttedFile = file.name.split('.');
        let extension = cuttedFile[cuttedFile.length - 1];
        if (validExtensions.indexOf(extension) < 0) {
            return res.status(403).json({
                ok: false,
                message: `The extension of the file is not allowed, the allowed ones are:${validExtensions.join(', ')}`
            })
        }
        let fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
        if (process.env.URLDB === 'mongodb://localhost:27017/escuelaAdminDb') {
            file.mv(`uploads/${type}/${fileName}`, (err) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                resolve({ fileName, extension })
            })
        } else {
            var params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Body: file.data,
                Key: fileName
            }
            s3.upload(params, function(err, data) {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                resolve({ data })
            });
        }
    })
}

const deleteFile = (location, fileName, res) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(location)) {
            fs.unlinkSync(location);
            if (!fs.existsSync(location)) {
                resolve()
            }
        } else {
            var params = { Bucket: 'cargomusicfilesstore', Key: fileName };
            s3.deleteObject(params, function(err, data) {
                if (err) { reject(res.status(500).json({ ok: false, err })) } else resolve()
            });
        }
    })
};

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
        deleteFile(fileDeleted.location, file.name).then(() => {
            res.status(200).json({ ok: true, file: fileDeleted })
        })
    })
})


module.exports = app;