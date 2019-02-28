const express = require('express');
const Day = require('../models/day');
const Event = require('../models/event');
const app = express();

const { verifyToken } = require('../middlewares/auth');


app.get('/dayByDate/:date', verifyToken, (req, res) => {

    let date = new Date(req.params.date);

    Day.findOne({
            date: { $eq: date }
        },
        (err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }
            if (!dayDb) {
                return res.status(200).json({ ok: false, message: 'No day has been found whose date match with yours', day: null })
            }
            res.status(200).json({ ok: true, day: dayDb })
        })
})

app.put('/pullEvent/:dayId/:eventId', (req, res) => {

    let dayId = req.params.dayId;
    let eventId = req.params.eventId;

    Event.findById(eventId, (err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }

        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'There are no events with the ID provided' })
        }
        let hour = `hour${eventDb.hour}`
        Day.findByIdAndUpdate(dayId, {
            $pull: {
                [hour]: eventDb._id
            }
        }, async(err, dayDb) => {

            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }

            if (!dayDb) {
                return res.status(404).json({ ok: false, message: 'There are no days with the ID provided' })
            }
            let dayDate = new Date(dayDb.date);

            let eventStartDate = new Date(eventDb.startDate);

            let eventEndDate = new Date(eventDb.endDate) || null;

            //Revisar//

            if (dayDate.getFullYear() === eventStartDate.getFullYear() && dayDate.getMonth() === eventStartDate.getMonth() && dayDate.getDate() === eventStartDate.getDate() && dayDate.getDay() === eventStartDate.getDay() ||
                dayDate.getFullYear() === eventEndDate.getFullYear() && dayDate.getMonth() === eventEndDate.getMonth() && dayDate.getDate() === eventEndDate.getDate() && dayDate.getDay() === eventEndDate.getDay()) {
                console.log('Coño')
                if (dayDate.getFullYear() === eventStartDate.getFullYear() && dayDate.getMonth() === eventStartDate.getMonth() && dayDate.getDate() === eventStartDate.getDate() && dayDate.getDay() === eventStartDate.getDay()) {
                    eventDb.startDate = new Date(eventStartDate.getTime() + 604800000)
                    console.log('No')
                }
                if (eventEndDate != null && dayDate.getFullYear() === eventEndDate.getFullYear() && dayDate.getMonth() === eventEndDate.getMonth() && dayDate.getDate() === eventEndDate.getDate() && dayDate.getDay() === eventEndDate.getDay()) {
                    eventDb.endDate = new Date(eventEndDate.getTime() - 604800000)
                }

                eventDb.save((err, eventSaved) => {
                    if (err) {
                        return res.status(500).json({ ok: false, message: err })
                    }
                    res.status(200).json({ ok: true, event: eventSaved })
                })

            } else {
                res.status(200).json({ ok: true, event: eventDb })
            }
        })
    })
})






module.exports = app;