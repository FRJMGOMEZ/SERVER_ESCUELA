const express = require('express');

const Alumno = require('../models/alumno');

const { verifyToken, verifyRole } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');

const app = express()

app.post('/alumno', [verifyToken, verifyRole, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;

    let alumno = new Alumno({
        fechaDeNacimiento: new Date(body.fechaDeNacimiento),
        nombre: body.nombre,
        email: body.email,
        materias: [],
        usuarios: []
    })

    ///////Aún no se implantar un array

    alumno.materias.push(body.materia1);

    alumno.usuarios.push(timeStamp);

    alumno.save((err, alumnoSaved) => {

        if (err) {

            return res.status(500).json({ ok: false, err })
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Alumno creado',
            alumnoSaved
        })
    })
})


app.get('/alumno', [verifyToken, timeStamp], (req, res) => {

    let desde = req.query.desde;
    let hasta = req.query.hasta;

    Alumno.find({})
        .skip(desde)
        .limit(hasta)
        .populate('Materias')
        .populate('IngresosRealizados')
        .populate('IngresosPendientes')
        .populate('Usuarios')
        .exec((err, alumnosDb) => {

            if (err) { return res.status(500).json({ ok: false, mensaje: err }) }

            res.json({
                ok: true,
                mensaje: 'Alumnos obtenidos correctamente',
                alumnos: alumnosDb
            })
        })
})



module.exports = app;