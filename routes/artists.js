const express = require('express');
const app = express()

const Artist = require('../models/artist');

const Indexcard = require('../models/indexCard');

const { verifyToken } = require('../middlewares/auth');

app.get('/artists', verifyToken, (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    Artist.find({})
        .skip(from)
        .limit(limit)
        .populate('user', 'name _id')
        .populate({
            path: 'payments',
            model: 'Payment',
            populate: {
                path: 'track',
                model: 'Track'
            }
        })
        .exec((err, artists) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Artist.countDocuments((err, count) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, artists, count })
            })
        })
})

app.post('/artist', verifyToken, (req, res) => {

    let body = req.body;
    let artist = new Artist({
        name: body.name,
        indexcard: body.indexcard,
        payments: [],
        tracks: [],
        user: body.user || undefined
    })
    artist.save((err, artist) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, artist })
    })
})



app.put('/artist/:id', verifyToken, (req, res) => {
    let body = req.body;
    let id = req.params.id
    Artist.findByIdAndUpdate(id, { name: body.name }, { new: true }, (err, artist) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!artist) {
            return res.status(404).json({ ok: false, message: 'There are no artists with the ID provided' })
        }
        res.status(200).json({ ok: true, artist })
    })
})

app.delete('/artist/:id', (req, res) => {

    let id = req.params.id;
    Artist.findByIdAndDelete(id, (err, artist) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!artist) {
            return res.status(404).json({ ok: false, message: 'There are no artists with the ID provided' })
        }
        Indexcard.findByIdAndDelete(artist.indexcard, (err, indexcard) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!indexcard) {
                return res.status(404).json({ ok: false, message: 'There are no indexcards with the ID provided' })
            }
            res.status(200).json({ ok: true, artist })
        })
    })
})

module.exports = app;