const express = require('express');

const Alumni = require('../models/alumni');
const Subject = require('../models/subject');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express()

app.get('/api/alumni', [verifyToken, verifyRole], (req, res) => {
    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    Alumni.find({})
        .skip(from)
        .limit(limit)
        .populate('indexcard', 'name _id')
        .populate('subjects', 'name _id')
        .exec((err, alumnisDb) => {
            if (err) { return res.status(500).json({ ok: false, message: err }) }
            Alumni.countDocuments((err, count) => {
                if (err) { return res.status(500).json({ ok: false, message: err }) }
                res.json({
                    ok: true,
                    alumnis: alumnisDb,
                    count
                })
            })
        })
})

app.post('/api/alumni', [verifyToken, verifyRole], (req, res) => {
    let body = req.body;
    let alumni = new Alumni({
        indexcard: body.indexcard
    })
    alumni.save((err, alumniSaved) => {
        if (err) {

            return res.status(500).json({ ok: false, err })
        }
        alumni.populate({ path: 'indexcard', select: 'name _id' }, (err, alumniDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, alumni: alumniDb })
        })

    })
})


app.put('alumni/api/addSubject/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let subjectId = req.body.materia;

    Alumni.updateOne({ id: id }, { $push: { subjects: subjectId } })
        .populate('indexcard', 'name _id')
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



app.delete('/api/alumni/:id', [verifyToken, verifyRole], (req, res) => {

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

        Subject.update({}, { $pull: { alumnis: alumniDeleted._id } })
            .exec((err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, alumni: alumniDeleted })
            })
    })
})


module.exports = app;