const express = require('express');
const Calendario = require('../models/calendario');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/calendario', (req, res) => {

    Calendario.find({}, (err, calendariosDb) => {

        if (err) {

            res.status(500).json({ ok: false, mensajes: err })
        }

        res.status(200).json({ ok: true, calendariosDb })
    })
})

app.post('/calendario', (req, res) => {

    let calendario = new Calendario({})
    calendario.fecha = new Date().toUTCString()

    calendario.save((err, calendarioGuardado) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }
        res.status(200).json({ ok: true, calendarioGuardado })
    })
})


app.put('/anadirEvento:id', verifyToken, (req, res) => {

    let evento = req.body.evento;
    let dia = req.body.dia;

    let id = req.params.id;

    Calendario.findById(id, (err, calendarioDb) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        if (!calendarioDb) {

            res.status(404).json({ ok: false, mensaje: 'No se encontraron calendario con el id especificado' })
        }
        switch (dia) {
            case 'lunes':
                calendario.lunes.push(evento);
                break;
            case 'martes':
                calendario.martes.push(evento);
                break;
            case 'miercoles':
                calendario.miercoles.push(evento);
                break;
            case 'jueves':
                calendario.jueves.push(evento);
                break;
            case 'viernes':
                calendario.viernes.push(evento);
                break;
            case 'sabado':
                calendario.sabado.push(evento);
                break;
            case 'domingo':
                calendario.domingo.push(evento);
                break;
        }

        calendario.save((err, calendarioGuardado) => {

            if (err) {

                res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, calendarioGuardado })
        })
    })
})
module.exports = app;