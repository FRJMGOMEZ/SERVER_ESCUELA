const express = require('express');

const Week = require('../models/week');
const Event = require('../models/event');
const Day = require('../models/day');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/week/:date', (req, res) => {

    let date = new Date(req.params.date);
    console.log(date)
    Week.find({
            "date": {
                "$eq": date
            }
        })
        .populate('monday', 'date _id')
        .populate('tuesday', 'date _id')
        .populate('wednesday', 'date _id')
        .populate('thursday', 'date _id')
        .populate('friday', 'date _id')
        .populate('saturday', 'date _id')
        .populate('sunday', 'date _id')
        .exec((err, weeksDb) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            if (!weeksDb) {
                res.status(200).json({ ok: true, weeks: [] })
            }
            res.status(200).json({ ok: true, weeks: weeksDb })
        })
})

app.post('/week', async(req, res) => {

    let body = req.body;
    let date = new Date(body.date);

    let monday = new Day({
        date: new Date(date),
        day: date.getDay()
    })
    let tuesday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })
    let wednesday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })
    let thursday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })
    let friday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })
    let saturday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })
    let sunday = new Day({
        date: date.setDate(date.getDate() + 1),
        day: date.getDay()
    })

    days = [monday, tuesday, wednesday, thursday, friday, saturday, sunday]

    await Promise.all([
        checkPermanentEvents(res, monday, date),
        checkPermanentEvents(res, tuesday, date),
        checkPermanentEvents(res, wednesday, date),
        checkPermanentEvents(res, thursday, date),
        checkPermanentEvents(res, friday, date),
        checkPermanentEvents(res, saturday, date),
        checkPermanentEvents(res, sunday, date)
    ]).then((responses) => {

        days[0] = responses[0] || days[0];
        days[1] = responses[1] || days[1];
        days[2] = responses[2] || days[2];
        days[3] = responses[3] || days[3];
        days[4] = responses[4] || days[4];
        days[5] = responses[5] || days[5];
        days[6] = responses[6] || days[6];

        Day.insertMany(days, (err, daysSaved) => {
            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }
            let daysIds = daysSaved.map(day => {
                return day._id;
            });
            let week = new Week({
                monday: daysIds[0],
                tuesday: daysIds[1],
                wednesday: daysIds[2],
                thursday: daysIds[3],
                friday: daysIds[4],
                saturday: daysIds[5],
                sunday: daysIds[6]
            })

            week.date = new Date(daysSaved[0].date);

            week.save((err, weekSaved) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                week.populate()
                    .populate('monday', 'date _id')
                    .populate('tuesday', 'date _id')
                    .populate('wednesday', 'date _id')
                    .populate('thursday', 'date _id')
                    .populate('friday', 'date _id')
                    .populate('saturday', 'date _id')
                    .populate({ path: 'sunday', select: 'date _id' }, (err, weekDb) => {
                        if (err) {
                            res.status(500).json({ ok: false, err })
                        }
                        res.status(200).json({ ok: true, week: weekDb })
                    })
            })
        })
    })

})

let checkPermanentEvents = (res, day, date) => {

    return new Promise((resolve, reject) => {

        let dateOfDay = new Date(day.date).getDay();

        console.log(date)

        if (date.getTime() + 1 > new Date()) {
            Event.find({ day: dateOfDay, permanent: true }, (err, eventsDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, message: err }))
                }
                let hour0 = eventsDb.filter((event) => { return event.hour === 0 }) || null;
                day.hour0 = hour0.map((event) => { return event._id })
                let hour1 = eventsDb.filter((event) => { return event.hour === 1 }) || null;
                day.hour1 = hour1.map((event) => { return event._id })
                let hour2 = eventsDb.filter((event) => { return event.hour === 2 }) || null;
                day.hour2 = hour2.map((event) => { return event._id })
                let hour3 = eventsDb.filter((event) => { return event.hour === 3 }) || null;
                day.hour3 = hour3.map((event) => { return event._id })
                let hour4 = eventsDb.filter((event) => { return event.hour === 4 }) || null;
                day.hour4 = hour4.map((event) => { return event._id })
                let hour5 = eventsDb.filter((event) => { return event.hour === 5 }) || null;
                day.hour5 = hour5.map((event) => { return event._id })
                let hour6 = eventsDb.filter((event) => { return event.hour === 6 }) || null;
                day.hour6 = hour6.map((event) => { return event._id })
                let hour7 = eventsDb.filter((event) => { return event.hour === 7 }) || null;
                day.hour7 = hour7.map((event) => { return event._id })
                let hour8 = eventsDb.filter((event) => { return event.hour === 8 }) || null;
                day.hour8 = hour8.map((event) => { return event._id })
                let hour9 = eventsDb.filter((event) => { return event.hour === 9 }) || null;
                day.hour9 = hour9.map((event) => { return event._id })
                let hour10 = eventsDb.filter((event) => { return event.hour === 10 }) || null;
                day.hour10 = hour10.map((event) => { return event._id })
                let hour11 = eventsDb.filter((event) => { return event.hour === 11 }) || null;
                day.hour11 = hour11.map((event) => { return event._id })

                resolve(day)
            })
        } else {
            resolve()
        }
    })
}

app.get('/weekByDay/:dayId/:dayOfTheWeek', (req, res) => {

    let dayId = req.params.dayId;
    let dayOfTheWeek = Number(req.params.dayOfTheWeek);

    let request;
    switch (dayOfTheWeek) {
        case 1:
            request = Week.find({ monday: dayId })
            break;
        case 2:
            request = Week.find({ tuesday: dayId })
            break;
        case 3:
            request = Week.find({ wednesday: dayId })
            break;
        case 4:
            request = Week.find({ thursday: dayId })
            break;
        case 5:
            request = Week.find({ friday: dayId })
            break;
        case 6:
            request = Week.find({ saturday: dayId })
            break;
        case 0:
            request = Week.find({ sunday: dayId })
            break;
    }
    request.exec((err, weekDb) => {
        if (err) {

            res.status(500).json({ ok: false, err })
        }
        if (!weekDb) {

            res.status(404).json({ ok: false, message: 'No weeks have been founded' })
        }
        res.status(200).json({ ok: true, week: weekDb })
    })
})




module.exports = app;