const express = require('express');
const Indexcard = require('../models/card');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

///// CONECTAR OTRA BASE DE DATOS PARA LAS INDEXCARD No enseñar el _id de las indexcard /////

app.get('/api/searchIndexcardById/:id', [verifyToken, verifyRole], (req, res) => {
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


app.post('/api/indexcard', (req, res) => {

    let body = req.body;

    newIndexcard = new Indexcard({
        name: body.name || undefined,
        surname: body.surname || undefined,
        email: body.email || undefined,
        mobile: body.mobile || undefined,
        home: body.home || undefined,
        address: body.address || undefined,
    })

    newIndexcard.save((err, indexcardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, indexcard: indexcardDb })
    })
})



app.put('/api/indexcard/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Indexcard.findById(id, (err, indexcardDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!indexcardDb) {
            return res.status(404).json({ ok: false, menssage: `There are no indexindexcard with the id:${id}` })
        }
        indexcardDb.name = body.name
        indexcardDb.surname = body.surname
        indexcardDb.email = body.email
        indexcardDb.mobile = body.mobile
        indexcardDb.home = body.home || indexcardDb.hom
        indexcardDb.address = body.address || indexcardDb.address;

        indexcardDb.save((err, indexcardUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: err })
            }
            res.status(200).json({ ok: true, indexcard: indexcardUpdated })
        })
    })
})



module.exports = app;