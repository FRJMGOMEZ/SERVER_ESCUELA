const express = require('express');
const Calendario = require('../models/calendario');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/calendarios', (req, res) => {

    Calendario.find({})
        .populate('monday', 'date _id')
        .populate('tuesday', 'date _id')
        .populate('wednesday', 'date _id')
        .populate('thursday', 'date _id')
        .populate('friday', 'date _id')
        .populate('saturday', 'date _id')
        .populate('sunday', 'date _id')
        .exec((err, calendariosDb) => {

            if (err) {

                res.status(500).json({ ok: false, mensajes: err })
            }

            res.status(200).json({ ok: true, calendariosDb })
        })
})

app.post('/calendario', (req, res) => {

    let body = req.body;

    let calendario = new Calendario({
        monday: body.days[0],
        tuesday: body.days[1],
        wednesday: body.days[2],
        thursday: body.days[3],
        friday: body.days[4],
        saturday: body.days[5],
        sunday: body.days[6]
    })

    calendario.fecha = new Date().toUTCString()

    calendario.save((err, calendarSaved) => {

        if (err) {

            res.status(500).json({ ok: false, mensaje: err })
        }

        Calendario.findById(calendarSaved._id)
            .populate('monday', 'date _id')
            .populate('tuesday', 'date _id')
            .populate('wednesday', 'date _id')
            .populate('thursday', 'date _id')
            .populate('friday', 'date _id')
            .populate('saturday', 'date _id')
            .populate('sunday', 'date _id')
            .exec((err, calendarDb) => {

                if (err) {
                    res.status(500).json({ ok: false, mensaje: err })
                }
                res.status(200).json({ ok: true, calendarSaved: calendarDb })
            })
    })
})


app.put('/addDay/:id', verifyToken, (req, res) => {

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
                calendarioDb.lunes.push(evento);
                break;
            case 'martes':
                calendarioDb.martes.push(evento);
                break;
            case 'miercoles':
                calendarioDb.miercoles.push(evento);
                break;
            case 'jueves':
                calendarioDb.jueves.push(evento);
                break;
            case 'viernes':
                calendarioDb.viernes.push(evento);
                break;
            case 'sabado':
                calendarioDb.sabado.push(evento);
                break;
            case 'domingo':
                calendarioDb.domingo.push(evento);
                break;
        }

        calendarioDb.save((err, calendarioGuardado) => {

            if (err) {

                res.status(500).json({ ok: false, mensaje: err })
            }

            res.status(200).json({ ok: true, calendarioGuardado })
        })
    })
})

app.get('/calendarByDay/:dayId/:dayOfTheWeek', (req, res) => {

    let dayId = req.params.dayId;
    let dayOfTheWeek = Number(req.params.dayOfTheWeek);

    let request;
    switch (dayOfTheWeek) {
        case 1:
            request = Calendario.find({ monday: dayId })
            break;
        case 2:
            request = Calendario.find({ tuesday: dayId })
            break;
        case 3:
            request = Calendario.find({ wednesday: dayId })
            break;
        case 4:
            request = Calendario.find({ thursday: dayId })
            break;
        case 5:
            request = Calendario.find({ friday: dayId })
            break;
        case 6:
            request = Calendario.find({ saturday: dayId })
            break;
        case 0:
            request = Calendario.find({ sunday: dayId })
            break;
    }

    request.exec((err, calendarDb) => {

        if (err) {

            res.status(500).json({ ok: false, message: err })
        }

        if (!calendarDb) {

            res.status(404).json({ ok: false, message: 'No calendars have been founded' })
        }

        res.status(200).json({ ok: true, calendar: calendarDb })

    })
})


module.exports = app;