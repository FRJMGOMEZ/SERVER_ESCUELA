const express = require('express');
const app = express();

const { verifyToken, verifyRole } = require('../middlewares/auth');
const Facilitie = require('../models/facilitie');


app.get('/facilities', verifyToken, (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit)

    Facilitie.find({})
        .skip(from)
        .limit(limit)
        .exec((err, facilitiesDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!facilitiesDb) {
                return res.status(404).json({ ok: false, mensaje: 'There are no facilities in the DB' })
            }
            Facilitie.count((err, count) => {
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
            return res.status(404).json({ ok: false, mensaje: 'There are no facilities in the DB' })
        }
        facilitieUpdated.name = body.name
        facilitieUpdated.status = body.status

        facilitieUpdated.save((err, facilitieSaved) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, facilitie: facilitieSaved })
        })
    })
})

app.delete('/facilitie/:id', (req, res) => {

    let id = req.params.id;

    Facilitie.findByIdAndDelete(id, (err, facilitieDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!facilitieDeleted) {
            return res.status(404).json({ ok: false, mensaje: 'There are no facilities in the DB' })
        }
        res.status(200).json({ ok: true, facilitie: facilitieDeleted })
    })

})

module.exports = app;