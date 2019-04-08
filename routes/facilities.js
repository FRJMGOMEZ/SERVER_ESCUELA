const express = require('express');
const app = express();

const { verifyToken, verifyRole } = require('../middlewares/auth');
const Facilitie = require('../models/facilitie');
const EventModel = require('../models/event');
const Day = require('../models/day');


app.get('/facilities', verifyToken, (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit)

    Facilitie.find()
        .skip(from)
        .limit(limit)
        .exec((err, facilitiesDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!facilitiesDb) {
                return res.status(404).json({ ok: false, message: 'There are no facilities in the DB' })
            }
            Facilitie.countDocuments((err, count) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, facilities: facilitiesDb, count })
            })
        })
})

app.post('/facilitie', [verifyToken, verifyRole], (req, res) => {
    let body = req.body;
    let facilitie = new Facilitie({ name: body.name });
    facilitie.save((err, facilitieSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, facilitie: facilitieSaved })
    })
})

app.put('/facilitie/:id', [verifyToken, verifyRole], (req, res) => {
    let body = req.body;
    let id = req.params.id;

    Facilitie.findById(id, (err, facilitieUpdated) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!facilitieUpdated) {
            return res.status(404).json({ ok: false, message: 'There are no facilities in the DB' })
        }
        facilitieUpdated.name = body.name;
        if (facilitieUpdated.status) {
            facilitieUpdated.status = false;
        } else {
            facilitieUpdated.status = true;
        }
        facilitieUpdated.save((err, facilitieSaved) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, facilitie: facilitieSaved })
        })
    })
})

app.delete('/facilitie/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Facilitie.findByIdAndDelete(id, (err, facilitieDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!facilitieDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no facilities in the DB' })
        }
        EventModel.find({ faciltie: facilitieDeleted._id }, (err, events) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            EventModel.deleteMany({ facilitie: facilitieDeleted._id }, { new: true }, async(err, eventsDeleted) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                let requests = [];
                if (events.length === 0) {
                    return res.status(200).json({ ok: true, facilitie: facilitieDeleted })
                } else {
                    await events.forEach((event) => {
                        let request = pullEventsInDays(res, event);
                        request.push(request)
                    })
                    Promise.all(requests).then(() => {
                        res.status(200).json({ ok: true, facilitie: facilitieDeleted })
                    })
                }
            })

        })
    })
})

const pullEventsInDays = (res, event) => {
    return new Promise((resolve, reject) => {
        let hour = `hour${event.hour}`;
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
            resolve()
        })

    })
}

module.exports = app;