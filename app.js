require('./config')

const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require("body-parser");


const app = express()

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


//Rutas
app.use(require('./routes/index.js'))

mongoose.connection.openUri("mongodb://localhost:27017/escuelaAdminDb", {
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