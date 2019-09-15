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
        .exec((err, tracksDb) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            res.status(200).json({ 
                ok: true, tracks: tracksDb })
        })
})

app.post('/track', async(req, res) => {

    let track = req.body;
    
    let assignations = []
    if(req.body.assignations.length > 0){
        await req.body.assignations.forEach((eachAssignation) => {
            let assignation = new Assignation({ artist: eachAssignation.artist, percent: eachAssignation.percent, album: eachAssignation.album })
            assignations.push(assignation)
        })
        console.log(track)
        Assignation.insertMany(assignations, (err, assignationsSaved) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            let assignationsIds = assignationsSaved.map((assignation) => { return assignation._id })

            let newTrack = new Track({ title: track.title, assignations: assignationsIds, album: track.album._id, percent: track.percent })
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

                        newTrack.populate('album', 'title _id')
                            .populate({
                                path: 'assignations',
                                model: 'Assignation',
                                populate: {
                                    path: 'artist',
                                    model: 'Artist',
                                    populate: {
                                        path: 'indexcard',
                                        model: 'Indexcard',
                                        select: 'name _id'
                                    }
                                }
                            }, (err, track) => {
                                if (err) {
                                    return res.status(505).json({ ok: false, err })
                                }
                                res.status(200).json({ ok: true, album: albumSaved, track })
                            })
                    })
            })
        })
    }else{
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

                    newTrack.populate('album', 'title _id')
                        .populate({
                            path: 'assignations',
                            model: 'Assignation',
                            populate: {
                                path: 'artist',
                                model: 'Artist',
                                populate: {
                                    path: 'indexcard',
                                    model: 'Indexcard',
                                    select: 'name _id'
                                }
                            }
                        }, (err, track) => {
                            if (err) {
                                return res.status(505).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, album: albumSaved, track })
                        })
                })
        })

    }
   
})

app.put('/track/:id',async (req, res) => {

   let body = req.body;
   await body.assignations.forEach((assignation, index) => {
        body.assignations[index].artist = assignation.artist._id
    })
    let id = req.body;

    Track.findById(id, (err, trackDb) => {
        if (err) {
            return res.status(505).json({ ok: false, err })
        }
        if (!trackDb) {
            return res.status(404).json({ ok: false, message: 'There are no tracks wih the ID provided' })
        }
        if (trackDb.title != body.title) { trackDb.title = body.title }
        trackDb.percent = body.percent;

        checkAssignations(res, body.assignations, trackDb.assignations).then((assignations) => {

            console.log(assignations);
            trackDb.assignations = assignations;

            trackDb.save((err, trackUpdated) => {
                if (err) {
                    return res.status(505).json({ ok: false, err })
                }
                if (!trackUpdated) {
                    return res.status(404).json({ ok: false, message: 'There are no tracks wih the ID provided' })
                }
                trackDb
                    .populate('album')
                    .populate({
                        path: 'assignations',
                        model: 'Assignation',
                        populate: {
                            path: 'artist',
                            model: 'Artist',
                            populate: {
                                path: 'indexcard',
                                model: 'Indexcard',
                                select: 'name _id'
                            }
                        }
                    }, (err, trackPopulated) => {
                        if (err) {
                            return res.status(505).json({ ok: false, err })
                        }

                        res.status(200).json({ ok: true, track:trackPopulated })
                    })
            })

        })
    })
})

const checkAssignations = (res, bodyAssignations, dbAssignations) => {
    return new Promise(async(resolve, reject) => {
        if (bodyAssignations.length === dbAssignations.length) {
            resolve(dbAssignations)
        } else if (bodyAssignations.length > dbAssignations.length) {
            let assignations = await bodyAssignations.slice(dbAssignations.length, bodyAssignations.length);
            Assignation.insertMany(assignations, async(err, assignationsSaved) => {
                if (err) {
                    return res.status(505).json({ ok: false, err })
                }
               await assignationsSaved.forEach((eachAssignation)=>{
                    dbAssignations.push(eachAssignation._id)
                })    
                resolve(dbAssignations);
            })
        } else if (dbAssignations.length > bodyAssignations.length) {
            dbAssignations = await dbAssignations.slice(0, bodyAssignations.length)
            let assignations = await dbAssignations.slice(bodyAssignations.length, dbAssignations.length);
            Assignation.deleteMany({ _id: assignations }, (err) => {
                if (err) {
                    return res.status(505).json({ ok: false, err })
                }
                resolve(dbAssignations)
            })
        }
    })
}

app.delete('/track/:id', (req, res) => {

    let id = req.params.id;
    Track.findByIdAndDelete(id, (err, trackDeleted) => {
        if (err) {
            return res.status(505).json({ ok: false, err })
        }
        if (!trackDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no tracks wih the ID provided' })
        }
        Assignation.deleteMany({ _id: trackDeleted.assignations }, (err) => {
            if (err) {
                return res.status(505).json({ ok: false, err })
            }
            if(trackDeleted.album){
                Album.findByIdAndUpdate(trackDeleted.album, { $pull: { tracks: trackDeleted._id } }, (err, albumSaved) => {
                    if (err) {
                        return res.status(505).json({ ok: false, err })
                    }
                    if (!albumSaved) {
                        return res.status(404).json({ ok: false, message: 'There are no albums wih the ID provided' })
                    }
                    res.status(200).json({ ok: true, track: trackDeleted })
                })
            }else{
                res.status(200).json({ ok: true, track: trackDeleted })
            }
        })
    })
})

module.exports = app;