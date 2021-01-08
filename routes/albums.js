const express = require('express');
const app = express();

const Album = require('../models/album');
const Track = require('../models/track');

const { verifyToken,verifyRole } = require('../middlewares/auth');

app.get('/api/albums', [verifyToken, verifyRole], (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    Album.find({})
        .skip(from)
        .limit(limit)
        .populate('tracks', 'title _id')
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

app.post('/api/album', [verifyToken, verifyRole], (req, res) => {
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

app.put('/api/album/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Album.findByIdAndUpdate(id, { title: body.title }, { new: true })
        .populate({
            path: 'tracks',
            model: 'Track',
            slecet: 'title _id',
            populate: {
                path: 'assignations',
                model: 'Assignation',
                populate: {
                    path: 'artist',
                    model: 'Artist',
                    populate: {
                        path: 'indexcard',
                        model: 'Indexcard',
                        select: 'name _id '
                    }
                }
            }
        })
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

app.put('/api/album/pushTrack/:albumId/:trackId', [verifyToken, verifyRole], (req, res) => {

    let albumId = req.params.albumId;
    let trackId = req.params.trackId;

    Album.findByIdAndUpdate(albumId, { $push: { tracks: trackId } }, { new: true })
        .populate({
            path: 'tracks',
            model: 'Track',
            slecet: 'title _id',
            populate: {
                path: 'assignations',
                model: 'Assignation',
                populate: {
                    path: 'artist',
                    model: 'Artist',
                    populate: {
                        path: 'indexcard',
                        model: 'Indexcard',
                        select: 'name _id '
                    }
                }
            }
        })
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

app.put('/api/album/pullTrack/:albumId/:trackId', [verifyToken, verifyRole], (req, res) => {

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

app.delete('/api/album/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Album.findByIdAndDelete(id)
    .populate('tracks','_id assignations')
    .exec(async(err,album)=> {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!album) {
            return res.status(404).json({ ok: false, message: 'There are no album with the ID provided' })
        }
    let requests = [];
      await album.tracks.forEach((track,index)=>{
           if(track.assignations.length === 0){
            requests.push(deleteTrack(res,track._id))
           }else{
            requests.push(removeAlbumInTrack(res,album._id))
           }
      })
      Promise.all(requests).then(()=>{
          res.status(200).json({ ok: true, album })
      })
    })
})

const deleteTrack = (res,trackId)=>{
    return new Promise((resolve,reject)=>{
            Track.findByIdAndDelete(trackId,(err,trackDeleted)=>{
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!trackDeleted) {
                    reject(res.status(404).json({ ok: false, message: 'There are no tracks with the ID provided' }))
                }
                resolve()
            })
    })
} 

const removeAlbumInTrack = (res,albumId)=>{
    return new Promise((resolve,reject)=>{
            Track.findOneAndUpdate({album:albumId},{album:undefined},(err,trackUpdated)=>{
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!trackUpdated) {
                    reject(res.status(404).json({ ok: false, message: 'There are no tracks with the ID provided' }))
                }
                resolve()
            })
    })
}


module.exports = app;