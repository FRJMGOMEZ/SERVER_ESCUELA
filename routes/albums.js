const express = require('express');
const app = express();

const Album = require('../models/album');

const { verifyToken } = require('../middlewares/auth');

app.get('/albums', verifyToken, (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    Album.find({})
        .skip(from)
        .limit(limit)
        .populate('tracks')
        .exec((err, albums) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Album.count((err, count) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, albums, count })
            })
        })
})

app.post('/album', verifyToken, (req, res) => {
    let body = req.body;
    let album = new Album({
        title: body.title,
        tracks: []
    })
    album.save((err, album) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        album.populate({ path: 'tracks' }, (err, albumDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, album })
        })
    })
})

app.put('/album/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Album.findByIdAndUpdate(id, { title: body.title }, { new: true })
        .populate('tracks')
        .exec((err, album) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!album) {
                return res.status(404).json({ ok: false, message: 'There are no album with the ID provided' })
            }
            res.status(200).json({ ok: true, album })
        })
})

app.put('/album/pushTrack/:albumId/:trackId', (req, res) => {

    let albumId = req.params.albumId;
    let trackId = req.params.trackId;

    Album.findByIdAndUpdate(albumId, { $push: { tracks: trackId } }, { new: true }, (err, album) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!album) {
            return res.status(404).json({ ok: false, message: 'There are no album with the ID provided' })
        }
        res.status(200).json({ ok: true, album })
    })
})

app.put('/album/pullTrack/:albumId/:trackId', (req, res) => {

    let albumId = req.params.albumId;
    let trackId = req.params.trackId;

    Album.findByIdAndUpdate(albumId, { $pull: { tracks: trackId } }, { new: true }, (err, album) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!album) {
            return res.status(404).json({ ok: false, message: 'There are no album with the ID provided' })
        }
        res.status(200).json({ ok: true, album })
    })
})

app.delete('/album/:id', (req, res) => {

    let id = req.params.id;

    Album.findByIdAndDelete(id, (err, album) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!album) {
            return res.status(404).json({ ok: false, message: 'There are no album with the ID provided' })
        }
        res.status(200).json({ ok: true, album })
    })
})


module.exports = app;