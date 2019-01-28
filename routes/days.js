const express = require('express');

const Day = require('../models/day');

const app = express();

const { verifyToken } = require('../middlewares/auth');


app.post('/days', verifyToken, (req, res) => {

    let body = req.body;

    let date = new Date(body.date);

    let monday = new Day({
        date: new Date(date)
    })
    let tuesday = new Day({
        date: date.setDate(date.getDate() + 1)
    })
    let wednesday = new Day({
        date: date.setDate(date.getDate() + 1)
    })
    let thursday = new Day({
        date: date.setDate(date.getDate() + 1)
    })
    let friday = new Day({
        date: date.setDate(date.getDate() + 1)
    })
    let saturday = new Day({
        date: date.setDate(date.getDate() + 1)
    })
    let sunday = new Day({
        date: date.setDate(date.getDate() + 1)
    })



    let days = [monday, tuesday, wednesday, thursday, friday, saturday, sunday];


    Day.insertMany(days, (err, daysSaved) => {

        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }

        res.status(200).json({ ok: true, daysSaved })
    })
})


app.put('/day/:id', verifyToken, (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Day.findById(id, (err, dayDb) => {

        if (err) {

            return res.status(500).json({ ok: false, message: err })
        }
        if (!dayDb) {

            return res.status(404).json({ ok: false, message: 'No day has been found whose ID match with yours' })
        }

        if (body.position >= 0 && body.position < 1) { dayDb['0'].push(body.id) };
        if (body.position >= 1 && body.position < 2) { dayDb['1'].push(body.id) };
        if (body.position >= 2 && body.position < 3) { dayDb['2'].push(body.id) };
        if (body.position >= 3 && body.position < 4) { dayDb['3'].push(body.id) };
        if (body.position >= 4 && body.position < 5) { dayDb['4'].push(body.id) };
        if (body.position >= 5 && body.position < 6) { dayDb['5'].push(body.id) };
        if (body.position >= 6 && body.position < 7) { dayDb['6'].push(body.id) };
        if (body.position >= 7 && body.position < 8) { dayDb['7'].push(body.id) };
        if (body.position >= 8 && body.position < 9) { dayDb['8'].push(body.id) };
        if (body.position >= 9 && body.position < 10) { dayDb['9'].push(body.id) };
        if (body.position >= 10 && body.position < 11) { dayDb['10'].push(body.id) };
        if (body.position >= 11 && body.position < 12) { dayDb['11'].push(body.id) };

        dayDb.save((err, daySaved) => {

            if (err) {

                return res.status(500).json({ ok: false, message: err })
            }

            res.status(200).json({ ok: true, daySaved })
        })
    })
})

app.get('/dayByDate/:date', verifyToken, (req, res) => {

    let date = new Date(req.params.date);

    let date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    Day.findOne({
            date: { $gte: date, $lt: date2 }
        },
        (err, dayDb) => {

            if (err) {

                return res.status(500).json({ ok: false, message: err })
            }

            if (!dayDb) {

                return res.status(200).json({ ok: false, message: 'No day has been found whose date match with yours', day: null })
            }
            console.log(dayDb.date)

            res.status(200).json({ ok: true, day: dayDb })
        })
})


module.exports = app;