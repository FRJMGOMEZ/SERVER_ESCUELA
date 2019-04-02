const express = require('express');
const Indexcard = require('../models/indexCard');
const Alumni = require('../models/alumni');
const Professor = require('../models/professor');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();


app.get('/searchIndexcardById/:id', [verifyToken, verifyRole], (req, res) => {
    let id = req.params.id;
    Indexcard.findById(id, (err, indexcardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!indexcardDb) {
            return res.status(404).json({ ok: false, message: 'There are no indexcards with the ID provided' })
        }
        res.status(200).json({ ok: true, indexcard: indexcardDb })
    })
})


app.post('/indexcard', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    Indexcard.findOne({ name: body.name }, (err, indexcardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: err })
        }
        if (indexcardDb) {
            Promise.all([
                checkProfessor(res, indexcardDb.name),
                checkAlumni(res, indexcardDb.name)
            ]).then(responses => {
                let professorId = responses[0];
                let alumniId = responses[1];
                if (alumniId) {
                    Alumni.updateOne({ id: alumniId }, { indexcard: indexcardDb._id })
                        .exec((err, alumniUpdated) => {
                            if (err) {
                                return res.status(500).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, indexcard: indexcardDb, alumni: alumniUpdated.name })
                        })
                } else if (professorId) {
                    Professor.updateOne({ id: professorId }, { indexcard: indexcardDb._id })
                        .exec((err, professorUpdated) => {
                            if (err) {
                                return res.status(500).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, indexcard: indexcardDb, professor: professorUpdated.name })
                        })
                } else {
                    res.status(200).json({ ok: true, indexcard: indexcardDb })
                }
            })
        } else {
            let indexcard = new Indexcard({
                role: body.role,
                name: body.name,
                surname: body.surname,
                email: body.email,
                mobile: body.mobile,
                home: body.home,
                address: body.address,
            })
            indexcard.save((err, indexcardDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                Promise.all([
                    checkProfessor(res, indexcardDb.name),
                    checkAlumni(res, indexcardDb.name)
                ]).then(responses => {
                    let professorId = responses[0];
                    let alumniId = responses[1];
                    if (alumniId) {
                        Alumni.updateOne({ id: alumniId }, { indexcard: indexcardDb._id })
                            .exec((err, alumniUpdated) => {
                                if (err) {
                                    return res.status(500).json({ ok: false, err })
                                }
                                res.status(200).json({ ok: true, indexcard: indexcardDb, alumni: alumniUpdated.name })
                            })
                    } else if (professorId) {
                        Professor.updateOne({ id: professorId }, { indexcard: indexcardDb._id })
                            .exec((err, professorUpdated) => {
                                if (err) {
                                    return res.status(500).json({ ok: false, err })
                                }
                                res.status(200).json({ ok: true, indexcard: indexcardDb, professor: professorUpdated.name })
                            })
                    } else {
                        res.status(200).json({ ok: true, indexcard: indexcardDb })
                    }
                })
            })
        }
    })
})



app.put('/indexcard/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Indexcard.findById(id, (err, indexcardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!indexcardDb) {
            return res.status(404).json({ ok: false, menssage: `There are no indexcards with the id:${id}` })
        }
        let previousName = indexcardDb.name;
        indexcardDb.name = body.name
        indexcardDb.surname = body.surname
        indexcardDb.email = body.email
        indexcardDb.mobile = body.mobile
        indexcardDb.home = body.home
        indexcardDb.address = body.address

        indexcardDb.save((err, indexcardUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: err })
            }
            if (previousName != indexcardUpdated.name) {
                let request;
                let role = indexcardUpdated.role;
                switch (indexcardUpdated.role) {
                    case 'ALUMNI':
                        request = Alumni.findOneAndUpdate({ name: previousName }, { name: indexcardUpdated.name }, { upsert: true, new: true })
                        break;
                    case 'PROFESSOR':
                        request = Professor.findOneAndUpdate({ name: previousName }, { name: indexcardUpdated.name }, { upsert: true, new: true })
                        break;
                }
                request.exec((err, itemUpdated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, [role]: itemUpdated })
                })
            } else {
                res.status(200).json({ ok: true })
            }
        })
    })
})

let checkProfessor = (res, name) => {
    return new Promise((resolve, reject) => {
        if (name) {
            Professor.find({ name: name }, (err, professorDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (professorDb) {
                    resolve(professorDb._id)
                } else { resolve() }
            })
        } else { resolve() }
    })
}

let checkAlumni = (res, name) => {
    return new Promise((resolve, reject) => {
        if (name) {
            Alumni.find({ name: name }, (err, alumniDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!alumniDb) {
                    resolve()
                } else {
                    resolve(alumniDb._id)
                }
            })
        } else { resolve() }
    })
}

module.exports = app;