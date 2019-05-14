const express = require('express');
const app = express();

const Assignation = require('../models/assignation');

app.post('/assignation', (req, res) => {

    let assignation = req.body;
    assignation = new Assignation({ artist: assignation.artist, percent: assignation.percent });

    assignation.save((err) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        assignation.populate({ path: 'artist', select: 'name _id' }, (err, assignationDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, assignation: assignationDb })
        })
    })
})

app.delete('/assignation/:id', (req, res) => {

    let id = req.params.id;

    Assignation.findByIdAndDelete(id, (err, assignationDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!assignationDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no assignations with the ID provided' })
        }
        res.status(200).json({ ok: true, assignation: assignationDeleted })
    })

})

module.exports = app;