const express = require('express');
const Assignation = require('../models/assignation');
const app = express();
const { verifyToken, verifyRole } = require('../middlewares/auth');

app.get('/api/assignations/:artistId', [verifyToken, verifyRole],(req, res) => {

    let artistId = req.params.artistId;

    Assignation.find({ artist: artistId })
        .populate({
            path: 'album',
            model: 'Album',
            populate: {
                path: 'tracks',
                model: 'Track',
                select: 'title _id assignations'
            }
        }).exec(async(err, assignations) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if(assignations.length === 0){
           return res.status(200).json({ ok: true, assignations:[]})
        }
          await assignations.forEach((assignation,index)=>{
           assignations[index].track = assignation.album.tracks.filter((track)=>{
                if(track.assignations.indexOf(String(assignation._id))>=0){
                    return track;
                }
            })[0]
            assignations[index].album = assignation.album._id;
           })
        res.status(200).json({ ok: true, assignations })
    })
})

module.exports = app;
