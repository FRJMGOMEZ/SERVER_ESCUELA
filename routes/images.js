const express = require('express');
const fs = require("fs");
const path = require('path');

const app = express();


app.get('/imagenes/:type/:fileName', (req, res, next) => {

    let type = req.params.type;
    let fileName = req.params.fileName;

    let pathImage = path.resolve(__dirname, `../uploads/${type}/${fileName}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage)
    } else {
        let pathNoImage = path.resolve(__dirname, '../assets/no-image.png');
        res.sendFile(pathNoImage)
    }
})

module.exports = app;