const express = require('express');

const Professor = require('../models/professor');
const Subject = require('../models/subject');
const IndexCard = require('../models/indexcard');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/professor', verifyToken, (req, res) => {

    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.limit) || 5;

    Professor.find({})
        .populate('subjects', 'name _id')
        .skip(from)
        .limit(limit)
        .exec((err, professorsDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!professorsDb) {
                return res.status(404).json({
                    ok: false,
                    message: 'There are no professors in the DB'
                })
            }
            Professor.count((err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    professors: professorsDb,
                    count
                })
            })
        })
})

app.post('/professor', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let professor = new Professor({
        name: body.name,
        indexcard: body.indexcard
    })
    professor.save((err, professorSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, professor: professorSaved })
    })
})

app.put('/professor/addSubject/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let subjectId = req.body.materia;

    Professor.updateOne({ id }, { $push: { subjects: subjectId } }, (err, professorDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!professorDb) {
            return res.status(404).json({
                ok: false,
                message: 'There are no professors with the ID provided'
            })
        }
        Subject.updateOne({ subjectId }, { $push: { professors: professorDb._id } })
            .exec((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                if (!professorDb) {
                    return res.status(404).json({
                        ok: false,
                        message: 'There are no subjects with the ID provided'
                    })
                }
                res.status(200).json({ ok: true })
            })
    })
})

app.put('/professor/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Professor.findByIdAndUpdate(id, { name: body.name }, (err, professorDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!professorDb) {
            return res.status(404).json({
                ok: false,
                message: 'There are no professors with the ID provided'
            })
        }
        res.status(200).json({ ok: true, professor: professorDb })
    })
})

app.delete('/professor/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    Professor.findByIdAndRemove(id, (err, professorDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!professorDeleted) {
            return res.status(404).json({
                ok: false,
                message: 'There are no professors with the ID provided'
            })
        }
        Subject.update({}, { $pull: { professors: professorDeleted._id } })
            .exec((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, professor: professorDeleted })
            })
    })
})

module.exports = app;