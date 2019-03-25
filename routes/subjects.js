const express = require('express');

const Subject = require('../models/subject');
const Professor = require('../models/professor');
const Alumni = require('../models/alumni')
const { verifyToken, verifyRole } = require('../middlewares/auth');
const app = express();

app.get('/subject', [verifyToken, verifyRole], (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit);

    Subject.find({})
        .skip(from)
        .limit(limit)
        .populate('alumnis', 'name _id')
        .populate('professors', 'name _id')
        .exec((err, subjectsDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!subjectsDb) {
                return res.status(404).json({
                    ok: false,
                    message: 'There are no subject in DB'
                })
            }
            Subject.countDocuments((err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    subjects: subjectsDb,
                    count
                })
            })
        })
})

app.post('/subject', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;

    let subject = new Subject({
        name: body.name
    })
    subject.save((err, subjectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({
            ok: true,
            subject: subjectDb
        })
    })
})

app.put('/subject/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Subject.findByIdAndUpdate(id, { name: body.name }, { new: true })
        .populate('alumnis', 'name _id')
        .populate('professors', 'name _id')
        .exec((err, subjectDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!subjectDb) {
                return res.status(404).json({ ok: false, mensaje: 'There are no subjects with the ID provided' })
            }
            res.status(200).json({ ok: true, subject: subjectDb })
        })

})

app.delete('/subject/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    Subject.findByIdAndDelete(id, (err, subjectDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!subjectDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no subjects with the ID provided' })
        }
        Professor.update({}, { $pull: { subjects: subjectDeleted._id } })
            .exec((err, professorUpdated) => {
                if (err) {
                    return res.status(500).json({ ok: false, mensaje: err })
                }
                Alumni.update({}, { $pull: { subjects: subjectDeleted._id } })
                    .exec((err, alumniUpdated) => {
                        if (err) {
                            return res.status(500).json({ ok: false, mensaje: err })
                        }
                        res.status(200).json({ subject: subjectDeleted })
                    })
            })
    })
})

app.put('/addOrDeleteAlumni/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let alumniId = req.body.alumniId;

    Subject.findById(id, (err, subjectDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!subjectDb) {
            return res.status(404).json({
                ok: false,
                message: 'There are no subjects with the ID provided'
            })
        }
        if (subjectDb.alumnis.indexOf(alumniId) < 0) {
            subjectDb.alumnis.push(alumniId)
            subjectDb.save((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                subjectDb.populate('alumnis', `name _id`)
                    .populate({ path: 'professors', select: 'name _id' }, (err, subjectUpdated) => {
                        updateAlumni(res, subjectUpdated._id, alumniId).then((response) => {
                            res.status(200).json({ ok: true, subject: subjectUpdated, alumni: response.alumni })
                        })
                    })
            })
        } else {
            subjectDb.alumnis = subjectDb.alumnis.filter((alumni) => { return alumni != alumniId })
            subjectDb.save((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                subjectDb.populate('alumnis', `name _id`)
                    .populate({ path: 'professors', select: 'name _id' }, (err, subjectUpdated) => {
                        updateAlumni(res, subjectUpdated._id, alumniId).then((response) => {
                            res.status(200).json({ ok: true, subject: subjectUpdated, alumni: response.alumni })
                        })

                    })
            })
        }
    })
})

app.put('/addOrDeleteProfessor/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let professorId = req.body.professorId;

    Subject.findById(id, (err, subjectDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!subjectDb) {
            return res.status(404).json({
                ok: false,
                message: 'There are no professors with the ID provided'
            })
        }
        if (subjectDb.professors.indexOf(professorId) < 0) {
            subjectDb.professors.push(professorId)
            subjectDb.save((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                subjectDb.populate('alumnis', `name _id`)
                    .populate({ path: 'professors', select: 'name _id' }, (err, subjectUpdated) => {
                        updateProfessor(res, subjectUpdated._id, professorId).then((response) => {
                            res.status(200).json({ ok: true, subject: subjectUpdated, professor: response.professor })
                        })
                    })
            })
        } else {
            subjectDb.professors = subjectDb.professors.filter((professor) => { return professor._id != professorId })
            subjectDb.save((err, subjectUpdated) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                subjectDb.populate('alumnis', `name _id`)
                    .populate({ path: 'professors', select: 'name _id' }, (err, subjectUpdated) => {
                        updateProfessor(res, subjectUpdated._id, professorId).then((response) => {
                            res.status(200).json({ ok: true, subject: subjectUpdated, professor: response.professor })
                        })
                    })
            })
        }
    })
})

let updateAlumni = (res, subjectId, alumniId) => {
    return new Promise((resolve, reject) => {
        Alumni.findById(alumniId, (err, alumniDb) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!alumniDb) {
                reject(res.status(404).json({ ok: false, message: 'No alumnis have been found with the ID provided' }))
            }
            if (alumniDb.subjects.indexOf(subjectId) < 0) {
                alumniDb.subjects.push(subjectId)
            } else {
                alumniDb.subjects = alumniDb.subjects.filter((subject) => { return JSON.stringify(subject) != JSON.stringify(subjectId); })
            }
            alumniDb.save((err, alumniUpdated) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                alumniDb.populate({ path: 'subjects', select: 'name _id' }, (err, alumni) => {

                    resolve({ alumni })
                })
            })
        })
    })
}

let updateProfessor = (res, subjectId, idProfessor) => {

    return new Promise((resolve, reject) => {
        Professor.findById(idProfessor, (err, professorDb) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!professorDb) {
                reject(res.status(404).json({ ok: false, message: 'No professors have been found with the ID provided' }))
            }
            if (professorDb.subjects.indexOf(subjectId) < 0) {
                professorDb.subjects.push(subjectId)
            } else {
                professorDb.subjects = professorDb.subjects.filter((subjects) => { return JSON.stringify(subjects) != JSON.stringify(subjectId) })
            }
            professorDb.save((err, professorUpdated) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }

                professorDb.populate({ path: 'subjects', select: 'name _id' }, (err, professor) => {

                    resolve({ professor })
                })
            })
        })
    })
}

module.exports = app;