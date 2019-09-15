const express = require('express');
const app = express()
const Artist = require('../models/artist');
const Indexcard = require('../models/card');
const { verifyToken } = require('../middlewares/auth');

app.get('/artists', verifyToken, (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    Artist.find({})
        .skip(from)
        .limit(limit)
        .populate('indexcard', 'name _id')
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
    let newArtist = new Artist({
        indexcard: body.indexcard,
        payments: [],
        tracks: [],
    })
    console.log(artist);
    newArtist.save((err, artist) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        artist.populate({ path: 'indexcard', select: 'name _id' }, (err, artistDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, artist: artistDb })
        })

    })
})


app.put('/artist/:id', verifyToken, (req, res) => {
    let body = req.body;
    let id = req.params.id
    Artist.findByIdAndUpdate(id, { name: body.name }, { new: true })
        .populate('indexcard', 'name _id')
        .exec((err, artist) => {
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
    Artist.findByIdAndDelete(id, (err, artistDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!artistDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no artists with the ID provided' })
        }
        Indexcard.findByIdAndDelete(artistDeleted.indexcard, (err, indexcardDeleted) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!indexcardDeleted) {
                return res.status(404).json({ ok: false, message: 'There are no indexcards with the ID provided' })
            }
            res.status(200).json({ ok: true, artist: artistDeleted })
        })
    })
})

module.exports = app;