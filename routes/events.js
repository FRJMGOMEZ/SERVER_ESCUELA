const express = require('express');
const Event = require('../models/event');
const Day = require('../models/day');
const _ = require('underscore')
const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express()


app.get('/permanentEvents', verifyToken, (req, res) => {

    Event.find({ permanent: true }, (err, eventsDb) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, events: eventsDb })
    })
})

app.post('/event/:dayId/:limitDate', verifyToken, (req, res) => {

    let dayId = req.params.dayId;
    let limitDate = Number(req.params.limitDate) || 8640000000000000;
    limitDate = new Date(limitDate)
    limitDate = new Date(limitDate.getFullYear(), limitDate.getMonth(), limitDate.getDate())

    let body = req.body;
    let event = new Event({
        name: body.name,
        description: body.description,
        user: req.user.userDb._id,
        hour: body.hour,
        day: body.day,
        facilitie: body.facilitie,
        duration: body.duration,
        position: body.position,
        repetition: body.repetition,
        startDate: body.startDate,
        endDate: body.endDate,
        permanent: body.permanent
    })

    event.save((err, eventSaved) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        event.populate({ path: 'facilitie', select: 'name _id' }, (err, eventDb) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            let request;
            let request2;
            Day.findById(dayId, (err, dayDb) => {

                if (err) {
                    res.status(500).json({ ok: false, err })
                }

                if (!eventDb) {
                    res.status(404).json({ ok: false, message: 'Event not found' })
                }

                let date = new Date(dayDb.date)
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
                console.log(eventDb.hour)

                switch (eventDb.hour) {
                    case 0:
                        request = Day.update({ _id: dayId }, { $push: { hour0: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour0: eventDb._id } });
                        break;
                    case 1:
                        request = Day.update({ _id: dayId }, { $push: { hour1: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour1: eventDb._id } });
                        break
                    case 2:
                        request = Day.update({ _id: dayId }, { $push: { hour2: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour2: eventDb._id } });
                        break;
                    case 3:
                        request = Day.update({ _id: dayId }, { $push: { hour3: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour3: eventDb._id } });
                        break;
                    case 4:
                        request = Day.update({ _id: dayId }, { $push: { hour4: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour4: eventDb._id } });
                        break;
                    case 5:
                        request = Day.update({ _id: dayId }, { $push: { hour5: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour5: eventDb._id } });
                        break;
                    case 6:
                        request = Day.update({ _id: dayId }, { $push: { hour6: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour6: eventDb._id } });
                        break;
                    case 7:
                        request = Day.update({ _id: dayId }, { $push: { hour7: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour7: eventDb._id } });
                        break;
                    case 8:
                        request = Day.update({ _id: dayId }, { $push: { hour8: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour8: eventDb._id } });
                        break;
                    case 9:
                        request = Day.update({ _id: dayId }, { $push: { hour9: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour9: eventDb._id } });
                        break;
                    case 110:
                        request = Day.update({ _id: dayId }, { $push: { hour10: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour10: eventDb._id } });
                        break;
                    case 11:
                        request = Day.update({ _id: dayId }, { $push: { hour11: eventDb._id } });
                        request2 = Day.updateMany({ day: dayDb.day, date: { $gt: date, $lt: limitDate } }, { $push: { hour11: eventDb._id } });
                        break;
                }

                if (eventDb.permanent) {

                    request2.exec((err, updated) => {
                        if (err) {
                            res.status(500).json({ ok: false, err })
                        }
                        res.status(200).json({ ok: true, event: eventDb })
                    })


                } else {

                    request.exec((err, updated) => {
                        if (err) {
                            res.status(500).json({ ok: false, err })
                        }
                        res.status(200).json({ ok: true, event: eventDb })
                    })

                }

            })
        })
    })
})

app.put('/event/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Event.findById(id, (err, eventDb) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        eventDb.name = body.name
        eventDb.description = body.description
        eventDb.professors = body.professors
        eventDb.subjects = body.subjects
        eventDb.duration = Number(body.duration);
        eventDb.position = Number(body.position)
        eventDb.repetition = body.repetition
        eventDb.save((err, eventSaved) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            eventDb.populate({ path: 'facilitie', select: 'name _id' }, (err, eventDb) => {
                res.status(200).json({ ok: true, event: eventDb })
            });

        })
    })

})

app.delete('/event/:id/:dayId', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let dayId = req.params.dayId;

    Event.findByIdAndDelete(id, (err, eventDb) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        let hour = `hour${eventDb.hour}`;
        if (eventDb.permanent) {
            Day.findById(dayId, (err, dayDb) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                if (!dayDb) {
                    res.status(404).json({ ok: false, message: 'No days have been found wich matches with the ID provided' })
                }
                Day.update({ day: dayDb.day }, {
                    $pull: {
                        [hour]: eventDb._id
                    }
                }, (err, updated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
            })

        } else {

            Day.findByIdAndUpdate(dayId, {
                $pull: {
                    [hour]: eventDb._id
                }
            }, (err, updated) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }

                res.status(200).json({ ok: true, event: eventDb })
            })

        }
    })
})


app.put('/checkPermanentEvents', (req, res) => {

    let body = req.body;

    Event.find({ permanent: true, day: body.day, facilitie: body.facilitie }, async(err, eventsDb) => {

        if (err) {
            res.status(500).json({ ok: false, err })
        }
        console.log(body)
        let from = body.position;
        let to = body.hour + body.duration;
        let eventsCollapsed = []
        await eventsDb.forEach((event) => {
            if (event.position >= from && event.position < to) {
                eventsCollapsed.push(event)
            }
        })
        await eventsDb.forEach((event) => {
            if (event.position < from && event.position + event.duration > from && eventsCollapsed.indexOf(event) < 0) {
                eventsCollapsed.push(event)
            }
        })
        console.log(eventsCollapsed)
        if (eventsCollapsed.length === 0) {
            res.status(200).json({ ok: true, days: [] })
        } else {
            Promise.all([
                checkEventsInDays(eventsCollapsed[0]),
                checkEventsInDays(eventsCollapsed[1]),
                checkEventsInDays(eventsCollapsed[2]),
                checkEventsInDays(eventsCollapsed[3]),
            ]).then((responses) => {
                console.log(responses)
                responses = responses.filter((response) => { return response != undefined })
                let days = []
                responses.forEach((response) => {
                    response.forEach((day) => {
                        if (days.indexOf(day) < 0) {
                            days.push(day)
                        }
                    })
                })

                days = _.sortBy(days, (day) => {
                    return day.date
                })

                res.status(200).json({ ok: true, day: days[0] })
            })
        }
    })
})

const checkEventsInDays = (event) => {
    return new Promise((resolve, reject) => {
        if (event) {
            let hour = `hour${event.hour}`
            Day.find({
                [hour]: event._id
            }).exec((err, days) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                resolve(days)
            })
        } else {
            resolve()
        }

    })
}


module.exports = app;