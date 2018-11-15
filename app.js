require('./config/config')

const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require("body-parser");


const app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Credentials, token");
    res.header('Access-Control-Allow-Methods', "POST, GET, PUT, DELETE, OPTIONS")
    next();
});

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


//Rutas
app.use(require('./routes/index.js'))

mongoose.connection.openUri(process.env.URLDB, {
    useNewUrlParser: true
});

//MongoDb
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
        console.log("DB PORT: 27017 \x1b[32m%s\x1b[0m", 'RUNNING')
    })
    /////////////////////////////////////////

//Listening request
app.listen(process.env.PORT, () => {
    console.log(`SERVER: ${process.env.PORT} \x1b[32m%s\x1b[0m`, ' RUNNING')
})