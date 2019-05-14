const express = require('express');
const app = express();

const Track = require('../models/track');
const Album = require('../models/album');
const Assignation = require('../models/assignation');

app.get('/tracks', (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);

    Track.find({})
        .skip(from)
        .limit(limit)
        .populate('album', 'title _id')
        .populate({
            path: 'assignations',
            model: 'Assignation',
            populate: {
                path: 'artist',
                model: 'Artist'
            }
        })
        .exec((err, tracksDb) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, tracks: tracksDb })
        })
})

app.post('/track', (req, res) => {

    let track = req.body;
    let assignations = track.assignations.map((assignation) => { return assignation._id })
    let newTrack = new Track({ title: track.title, assignations, album: track.album, percent: track.percent })
    newTrack.save((err, trackSaved) => {
        if (err) {
            return res.status(505).json({ ok: false, err })
        }
        Album.findByIdAndUpdate(trackSaved.album, { $push: { tracks: trackSaved._id } }, { new: true })
            .populate('tracks')
            .exec((err, albumSaved) => {
                if (err) {
                    return res.status(505).json({ ok: false, err })
                }
                if (!albumSaved) {
                    return res.status(404).json({ ok: false, message: 'There are no albums wih the ID provided' })
                }
                res.status(200).json({ ok: true, album: albumSaved, track: trackSaved })
            })
    })
})

app.put('/track/:id', (req, res) => {

    let body = req.body;
    let id = req.body;

    Track.findByIdAndUpdate(id, { title: body.title }, { new: true })
        .populate('album')
        .populate({
            path: 'assignations',
            model: 'Assignation',
            populate: {
                path: 'artist',
                model: 'Artist'
            }
        })
        .exec((err, trackUpdated) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            if (!trackUpdated) {
                return res.status(404).json({ ok: false, message: 'There are no tracks wih the ID provided' })
            }
            res.status(200).json({ ok: true, track: trackUpdated })
        })
})

app.delete('/track/:id', (req, res) => {

    let id = req.params.id;
    Track.findByIdAndDelete(id, (err, trackDeleted) => {
        if (err) {
            return res.status(505).json({ ok: false, err })
        }
        if (!trackDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no tracks wih the ID provided' })
        }
        Album.findByIdAndUpdate(trackDeleted.album, { $pull: { tracks: trackDeleted._id } }, (err, albumSaved) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            if (!albumSaved) {
                return res.status(404).json({ ok: false, message: 'There are no albums wih the ID provided' })
            }

            Assignation.deleteMany({ _id: trackDeleted.assignations }, (err) => {
                if (err) {
                    return res.status(505).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, track: trackDeleted })
            })
        })
    })
})

module.exports = app;