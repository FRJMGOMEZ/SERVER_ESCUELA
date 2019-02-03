const express = require('express');
const app = express();

const { verifyToken } = require('../middlewares/auth');
const Facilitie = require('../models/facilitie');


app.get('/facilitie', verifyToken, (req, res) => {

    Facilitie.find({}, (err, facilitiesDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!facilitiesDb) {
            return res.status(404).json({ ok: false, mensaje: 'There are no facilities in the DB' })
        }
        res.status(200).json({ ok: true, facilities: facilitiesDb })
    })
})

app.post('/facilitie', verifyToken, (req, res) => {

    let body = req.body;

    let facilitie = new Facilitie({ name: body.name });
    facilitie.save((err, facilitieSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, facilitie: facilitieSaved })
    })
})

module.exports = app;