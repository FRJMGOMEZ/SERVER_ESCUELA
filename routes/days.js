const express = require('express');
const Day = require('../models/day');
const app = express();

const { verifyToken } = require('../middlewares/auth');


app.get('/dayByDate/:date', verifyToken, (req, res) => {

    let date = new Date(Number(req.params.date));
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), -date.getTimezoneOffset(), 0, 0);
    Day.findOne({
            date: { $eq: date }
        })
        .populate('hour0')
        .populate('hour1')
        .populate('hour2')
        .populate('hour3')
        .populate('hour4')
        .populate('hour5')
        .populate('hour6')
        .populate('hour7')
        .populate('hour8')
        .populate('hour9')
        .populate('hour10')
        .populate('hour11')
        .exec((err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }
            if (!dayDb) {
                return res.status(200).json({ ok: false, message: 'No day has been found whose date match with yours', day: null })
            }
            res.status(200).json({ ok: true, day: dayDb })
        })
})


module.exports = app;