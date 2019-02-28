const express = require('express');

const Alumni = require('../models/alumni');
const Subject = require('../models/subject');
const IndexCard = require('../models/indexcard');

const { verifyToken } = require('../middlewares/auth');

const app = express()

app.get('/alumni', verifyToken, (req, res) => {
    let from = Number(req.query.from);
    let limit = Number(req.query.limit);

    Alumni.find({})
        .skip(from)
        .limit(limit)
        .populate('subjects', 'name _id')
        .exec((err, alumnisDb) => {
            if (err) { return res.status(500).json({ ok: false, message: err }) }
            Alumni.count((err, count) => {
                if (err) { return res.status(500).json({ ok: false, message: err }) }
                res.json({
                    ok: true,
                    alumnis: alumnisDb,
                    count
                })
            })
        })
})

app.post('/alumni', verifyToken, (req, res) => {
    let body = req.body;
    let alumni = new Alumni({
        name: body.name,
        indexcard: body.indexcard
    })
    alumni.save((err, alumniSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, alumni: alumniSaved })
    })
})


app.put('alumni/addSubject/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let subjectId = req.body.materia;

    Alumni.updateOne({ id: id }, { $push: { subjects: subjectId } })
        .exec((err, alumniUpdated) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!alumniUpdated) {
                return res.status(404).json({
                    ok: false,
                    menssage: 'There are no alumnis with de ID provided'
                })
            }
            Subject.updateOne({ id: subjectId }, { $push: { alumnis: alumniUpdated._id } })
                .exec((err, subjectUpdated) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        })
                    }
                    res.status(200).json({ ok: true, alumni: alumniUpdated, subject: subjectUpdated.name })
                })
        })
})



app.delete('/alumni/:id', (req, res) => {

    let id = req.params.id;

    Alumni.findByIdAndDelete(id, (err, alumniDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!alumniDeleted) {

            return res.status(404).json({
                ok: false,
                message: 'There are no alumnis with de ID provided'
            })
        }
        Subject.updateOne({}, { $pull: { alumnis: alumniDeleted._id } })
            .exec((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                IndexCard.findByIdAndUpdate({ _id: alumniDeleted._id }, { status: false }, (err, indexCardUpdated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ alumni: alumniDeleted, subject: subjectUpdated, indexCard: indexCardUpdated })
                })
            })
    })
})


module.exports = app;