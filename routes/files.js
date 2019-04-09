const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const FileModel = require('../models/file');
const request = require('request');
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
const AWS = require('aws-sdk');
const toStream = require('streamifier');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.use(fileUpload());

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.get('/files/:type/:fileName', (req, res) => {

    let type = req.params.type;
    let fileName = req.params.fileName;

    if (type === 'front') {
        let pathImage = path.resolve(__dirname, `../assets/cargoImages/${fileName}`);
        if (fs.existsSync(pathImage)) {
            res.sendFile(pathImage)
        } else {
            let pathNoImage = path.resolve(__dirname, '../assets/no-image.png');
            res.sendFile(pathNoImage)
        }
    } else if (type === 'icons') {
        let pathImage = path.resolve(__dirname, `../assets/${type}/${fileName}`);
        if (fs.existsSync(pathImage)) {
            res.sendFile(pathImage)
        } else {
            let pathNoImage = path.resolve(__dirname, '../assets/no-image.png');
            res.sendFile(pathNoImage)
        }
    }
})

app.put('/upload/:type/:id/:download', upload.single('file'), (req, res) => {
    let type = req.params.type;
    let id = req.params.id;
    let file = req.files['file']
    if (!file) {
        return res.status(400).json({
            ok: false,
            message: 'No images have been selected'
        });
    }

    let newFile;
    if (process.env.URLDB === 'mongodb://localhost:27017/escuelaAdminDb') {
        recordFileDev(res, type, file, id).then(async(response) => {
            newFile = await new FileModel({ name: response.fileName, title: file.name, download: req.params.download, format: response.extension, type: type })
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
                        }
                        if (!itemUpdated) {
                            deleteFile(fileName, type)
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
                        }
                        res.status(200).json({ file })
                    })
                } else {
                    res.status(200).json({ file })
                }
            })
        })
    } else {
        console.log(file)
        var s3 = new AWS.S3();
        var buf = Buffer.from(file.data)
        const stream = toStream.createReadStream(buf)
        console.log(stream)
        var params = {
            Bucket: 'cargomusicfilesstorage',
            Body: fs.createReadStream(stream),
            Key: "folder/" + Date.now() + "_" + path.basename(buf)
        }
        s3.upload(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Uploaded in:", data.Location);
                checkFileProd(res, type, file, id).then(async(response) => {
                    newFile = await new FileModel({ name: response.fileName, title: file.name, download: req.params.download, format: response.extension, type: type })
                    newFile.file.url = data.Location;
                    console.log(data.Location)
                    newFile.save((err, file) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                error
                            })
                        }
                        res.status(200).json({ file })
                    })
                })

            }
        });
    }
});


const recordFileDev = (res, type, file, id) => {
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

const checkFileProd = (res, type, file, id) => {
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
        resolve({ fileName, extension })
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