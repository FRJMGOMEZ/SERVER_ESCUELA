const express = require('express');
const Event = require('../models/event');
const { verifyToken } = require('../middlewares/auth');

const app = express()

app.post('/event', verifyToken, (req, res) => {

    let body = req.body;
    let event = new Event({
        name: body.name,
        description: body.description,
        user: req.user.user._id,
        professors: body.professors,
        subjects: body.subjects,
        facilitie: body.facilitie,
        duration: body.duration,
        position: body.position,
        repetition: body.repetition
    })
    event.save((err, eventSaved) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        event.populate('facilitie', 'name')
            .populate('professors', 'name')
            .populate('subjects', 'name')
            .exec((err, eventDb) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, event: eventDb })
            })
    })
})

app.put('/event/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;
    Event.findById(id, (err, eventDb) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        eventDb.name = body.name
        eventDb.description = body.description
        eventDb.professors = body.professors
        eventDb.subjects = body.subjects
        eventDb.facilitie = body.facilitie
        eventDb.duration = Number(body.duration);
        eventDb.position = Number(body.position)
        eventDb.repetition = body.repetition
        eventDb.save((err, eventSaved) => {

            if (err) {
                res.status(500).json({ ok: false, err })
            }

            eventDb.populate('facilitie', 'name')
                .populate('professors', 'name')
                .populate('subjects', 'name')
                .exec((err, eventDb) => {
                    if (err) {
                        res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
        })
    })
})

module.exports = app;