const express = require('express');
const EventModel = require('../models/event');
const Day = require('../models/day');
const _ = require('underscore')
const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express()


app.get('/permanentEvents', verifyToken, (req, res) => {
    EventModel.find({ permanent: true }, (err, eventsDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, events: eventsDb })
    })
})

app.get('/events/projects/:projectId', verifyToken, (req, res) => {
    let projectId = req.params.projectId;
    EventModel.find({ project: projectId })
        .populate('user')
        .exec((err, events) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, events })
        })
})

app.get('/events', verifyToken, (req, res) => {
    let today = new Date()
    let from = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    from.setTime(from.getTime() - 604800000 * 2);
    EventModel.find({ startDate: { $gte: from } })
        .populate('facilitie', 'name')
        .exec((err, events) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            events.forEach((eachEvent) => {
                if (eachEvent.permanent && eachEvent.endDate === null) {
                    events = events.filter((event) => { return event._id != eachEvent._id })
                }
            })
            res.status(200).json({ ok: true, events })
        })
})

app.post('/event/:dayId/:limitDate', [verifyToken, verifyRole], (req, res) => {

    let dayId = req.params.dayId;

    let body = req.body;
    let event = new EventModel({
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
        permanent: body.permanent,
        project: body.project || null
    })
    event.save((err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        Day.findById(dayId, (err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!eventDb) {
                return res.status(404).json({ ok: false, message: 'Event not found' })
            }

            let to = new Date(Number(req.params.limitDate));
            let from = new Date(dayDb.date)

            let hour = `hour${eventDb.hour}`;

            let request = Day.update({ _id: dayId }, {
                $push: {
                    [hour]: eventDb._id
                }
            });

            let request2 = Day.updateMany({ day: dayDb.day, date: { $gte: from, $lte: to } }, {
                $push: {
                    [hour]: eventDb._id
                }
            });
            if (eventDb.permanent) {
                request2.exec((err, updated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
            } else {

                request.exec((err, updated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
            }
        })
    })
})

app.put('/event/:id', [verifyToken, verifyRole], async(req, res) => {

    let id = req.params.id;
    let body = req.body;
    EventModel.findById(id, async(err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        await checkPermanecy(res, body, eventDb)
        eventDb.name = body.name
        eventDb.description = body.description
        eventDb.professors = body.professors
        eventDb.subjects = body.subjects
        eventDb.duration = Number(body.duration);
        eventDb.position = Number(body.position)
        eventDb.repetition = body.repetition;
        eventDb.endDate = body.endDate;
        eventDb.startDate = body.startDate;
        eventDb.permanent = body.permanent;
        eventDb.save((err, eventDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, event: eventDb })
        })

    })
})
const checkPermanecy = async(res, body, eventDb) => {
    let updatedEventEndDate;
    let eventDbEndDate;
    let from;
    let to;
    let request;
    let hour = `hour${parseInt(eventDb.hour)}`;
    if (body.permanent) {
        if (eventDb.endDate) {
            eventDbEndDate = new Date(eventDb.endDate);
            if (body.endDate) {
                updatedEventEndDate = new Date(body.endDate)
            } else {
                updatedEventEndDate = new Date(8630000000000000)
            }
            if (updatedEventEndDate.getTime() > eventDbEndDate.getTime()) {
                from = new Date(eventDbEndDate);
                to = new Date(updatedEventEndDate);
                request = '+';
            } else if (updatedEventEndDate.getTime() < eventDbEndDate.getTime()) {
                from = new Date(updatedEventEndDate);
                to = new Date(eventDbEndDate);
                request = '-'
            }
        } else {
            if (eventDb.permanent) {
                from = new Date(body.endDate);
                from = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7, 0, 0, 0, 0)
                to = new Date(8630000000000000);
                request = '-'
            } else {
                if (body.endDate) {
                    from = new Date(body.startDate);
                    to = new Date(body.endDate);
                    request = '+'
                } else {
                    from = new Date(body.startDate);
                    to = new Date(8630000000000000)
                    request = '+'
                }
            }
        }
    } else {
        if (eventDb.permanent) {
            if (eventDb.endDate) {
                from = new Date(eventDb.startDate)
                from = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7, 0, 0, 0, 0);
                to = new Date(eventDb.endDate)
                request = '-'
            } else {
                from = new Date(body.startDate)
                from = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7, 0, 0, 0, 0);
                to = new Date(8630000000000000);
                request = '-'
            }
        }
    }
    if (request === '+') {
        await addEventToDays(res, hour, eventDb, from, to).then(() => {
            return
        })
    } else if (request === '-') {
        await removeEventFromDays(res, hour, eventDb, from, to).then(() => {
            return
        })
    } else {
        return
    }
}


const removeEventFromDays = (res, hour, eventDb, from, to) => {
    return new Promise((resolve, reject) => {
        Day.updateMany({
            day: eventDb.day,
            date: { $gte: from, $lte: to },
            [hour]: eventDb._id
        }, {
            $pull: {
                [hour]: eventDb._id
            }
        }, (err) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            resolve()
        })
    })
}

const addEventToDays = (res, hour, eventDb, from, to) => {
    return new Promise((resolve, reject) => {
        Day.updateMany({
            day: Number(eventDb.day),
            date: { $gte: from, $lte: to },
        }, {
            $push: {
                [hour]: eventDb._id
            }
        }, (err) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            resolve()
        })
    })
}

app.put('/pullEvent/:dayId/:eventId', [verifyToken, verifyRole], (req, res) => {
    let dayId = req.params.dayId;
    let eventId = req.params.eventId;
    EventModel.findById(eventId, (err, eventDb) => {
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
        }, (err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }
            if (!dayDb) {
                return res.status(404).json({ ok: false, message: 'There are no days with the ID provided' })
            }
            let dayDate = new Date(dayDb.date);
            let eventStartDate = new Date(eventDb.startDate);
            let eventEndDate;
            if (eventDb.endDate != null) {
                eventEndDate = new Date(eventDb.endDate)
                if (eventEndDate.getTime() === dayDate.getTime()) {
                    eventDb.endDate = new Date(eventEndDate.getTime() - 604800000)
                }
            }
            if (dayDate.getTime() === eventStartDate.getTime()) {
                eventDb.startDate = new Date(eventStartDate.getTime() + 604800000)
            } else {
                return res.status(200).json({ ok: true, event: eventDb })
            }
            eventDb.save((err, eventSaved) => {
                if (err) {
                    return res.status(500).json({ ok: false, message: err })
                }
                res.status(200).json({ ok: true, event: eventSaved })
            })
        })
    })
})

app.put('/checkPermanentEvents', verifyToken, (req, res) => {

    let myEvent = req.body;
    EventModel.find({ permanent: true, day: myEvent.day, facilitie: myEvent.facilitie }, async(err, eventsDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        let from = myEvent.position;
        let to = myEvent.hour + myEvent.duration;
        let eventsCollapsed = []
        await eventsDb.forEach((event) => {
            if (event.position >= from && event.position < to) {
                if (myEvent._id) {
                    if (event._id != myEvent._id) {
                        eventsCollapsed.push(event)
                    }
                } else {
                    eventsCollapsed.push(event)
                }
            }
        })
        await eventsDb.forEach((event) => {
            if (event.position < from && event.position + event.duration > from && eventsCollapsed.indexOf(event) < 0) {
                if (myEvent._id) {
                    if (event._id != myEvent._id) {
                        eventsCollapsed.push(event)
                    }
                } else {
                    eventsCollapsed.push(event)
                }
            }
        })
        if (eventsCollapsed.length === 0) {
            res.status(200).json({ ok: true, days: [] })
        } else {
            Promise.all([
                checkEventsInDays(eventsCollapsed[0]),
                checkEventsInDays(eventsCollapsed[1]),
                checkEventsInDays(eventsCollapsed[2]),
                checkEventsInDays(eventsCollapsed[3]),
            ]).then((responses) => {
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
                res.status(200).json({ ok: true, day: days[1] })
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
                    return res.status(500).json({ ok: false, err })
                }
                resolve(days)
            })
        } else {
            resolve()
        }
    })
}

app.delete('/event/:id', [verifyToken, verifyRole], (req, res) => {
    let id = req.params.id;
    EventModel.findByIdAndDelete(id, (err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        let hour = `hour${eventDb.hour}`;
        Day.updateMany({
            [hour]: eventDb._id
        }, {
            $pull: {
                [hour]: eventDb._id
            }
        }, (err, updated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            return res.status(200).json({ ok: true, event: eventDb })
        })
    })
})


module.exports = app