const express = require('express');
const Calendar = require('../models/calendar');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/calendars', (req, res) => {
    Calendar.find({})
        .populate('monday', 'date _id')
        .populate('tuesday', 'date _id')
        .populate('wednesday', 'date _id')
        .populate('thursday', 'date _id')
        .populate('friday', 'date _id')
        .populate('saturday', 'date _id')
        .populate('sunday', 'date _id')
        .exec((err, calendarsDb) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, calendarsDb })
        })
})

app.post('/calendar', (req, res) => {

    let body = req.body;

    let calendar = new Calendar({
        monday: body.days[0],
        tuesday: body.days[1],
        wednesday: body.days[2],
        thursday: body.days[3],
        friday: body.days[4],
        saturday: body.days[5],
        sunday: body.days[6]
    })
    calendar.date = new Date();
    calendar.save((err, calendarSaved) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        calendar.populate()
            .populate('monday', 'date _id')
            .populate('tuesday', 'date _id')
            .populate('wednesday', 'date _id')
            .populate('thursday', 'date _id')
            .populate('friday', 'date _id')
            .populate('saturday', 'date _id')
            .populate('sunday', 'date _id')
            .exec((err, calendarDb) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, calendar: calendarDb })
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

            res.status(500).json({ ok: false, err })
        }
        if (!calendarDb) {

            res.status(404).json({ ok: false, message: 'No calendars have been founded' })
        }
        res.status(200).json({ ok: true, calendar: calendarDb })
    })
})


module.exports = app;