const express = require('express');

const IndexCard = require('../models/indexCard');
const Alumni = require('../models/alumni');
const Professor = require('../models/professor');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/indexCards', [verifyToken, verifyRole], (req, res) => {

    let from = req.query.from;
    let limit = req.query.limit;

    IndexCard.find({})
        .skip(from)
        .limit(limit)
        .exec((err, indexCardsDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!IndexCardsDb) {
                return res.status(404).json({ ok: false, mensaje: 'There are no indexCards with the ID provided' })
            }
            res.status(200).json({ ok: true, indexCardsDb })
        })
})

app.post('/indexCard', [verifyToken, verifyRole], (req, res) => {

    let personId = req.query.id;
    let body = req.body;

    IndexCard.findOne({ name: body.name }, (err, indexCardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: err })
        }
        if (indexCardDb) {
            Promise.all([
                checkProfessor(res, personId),
                checkAlumni(res, personId)
            ]).then(responses => {
                let professor = responses[0];
                let alumni = responses[1];
                if (alumni) {
                    Alumni.updateOne({ id }, { indexCard: indexCardDb._id })
                        .exec((err, alumniUpdated) => {
                            if (err) {
                                return res.status(500).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, indexCard: IndexCardDb, alumni: alumniUpdated.name })
                        })
                } else if (professor) {
                    Professor.updateOne({ id }, { indexCard: indexCardDb._id })
                        .exec((err, professorUpdated) => {
                            if (err) {
                                return res.status(500).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, indexCard: IndexCardDb, professor: professorUpdated.name })
                        })
                } else {
                    res.status(404).json({ ok: false, message: 'There are no previous professor/alumni record' })
                }
            })
        } else {
            let indexCard = new IndexCard({
                role: body.role,
                name: body.name,
                surname: body.surname,
                email: body.email,
                mobile: body.mobile,
                home: body.home,
                address: body.address,
            })
            indexCard.save((err, IndexCardDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                Promise.all([
                    checkProfessor(res, personId),
                    checkAlumni(res, personId)
                ]).then(responses => {
                    let professor = responses[0];
                    let alumni = responses[1];

                    if (alumni) {
                        Alumni.updateOne({ id }, { indexCard: indexCardDb._id })
                            .exec((err, alumniUpdated) => {
                                if (err) {
                                    return res.status(500).json({ ok: false, err })
                                }
                                res.status(200).json({ ok: true, indexCard: IndexCardDb, alumni: alumniUpdated.name })
                            })
                    } else if (professor) {
                        Professor.updateOne({ id }, { indexCard: indexCardDb._id })
                            .exec((err, professorUpdated) => {
                                if (err) {
                                    return res.status(500).json({ ok: false, err })
                                }
                                res.status(200).json({ ok: true, indexCard: IndexCardDb, professor: professorUpdated.name })
                            })
                    } else {
                        res.status(404).json({ ok: false, message: 'There are no previous professor/alumni record' })
                    }
                })
            })
        }
    })
})



app.put('/indexCard/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    IndexCard.findById(id, (err, indexCardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!indexCardDb) {
            return res.status(404).json({ ok: false, menssage: `There are no IndexCards with the id:${id}` })
        }
        let previousName = indexCardDb.name;
        indexCardDb.name = body.name
        indexCardDb.surname = body.surname
        IndexCardDb.email = body.email
        IndexCardDb.mobile = body.mobile
        IndexCardDb.home = body.home
        IndexCardDb.address = body.address

        IndexCardDb.save((err, indexCardUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: err })
            }
            if (previousName != indexCardUpdated.name) {
                let request;
                switch (indexCardUpdated.role) {
                    case 'ALUMNI':
                        request = Alumni.updateOne({ name: previousName }, { name: indexCardUpdated.name })
                        break;
                    case 'PROFESSOR':
                        request = Professor.updateOne({ name: previousName }, { name: IndexCardUpdated.name })
                        break;
                }
                request.exec((err, item) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, indexCard: IndexCardUpdated })
                })
            } else {
                res.status(200).json({ ok: true, indexCard: IndexCardUpdated })
            }
        })
    })
})

let checkProfessor = (res, id) => {
    return new Promise((resolve, reject) => {
        if (id) {
            Professor.findById(id, (err, professorDb) => {
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

let checkAlumni = (res, id) => {
    return new Promise((resolve, reject) => {
        if (id) {
            Alumni.findById(id, (err, alumniDb) => {
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