const express = require('express');

const Project = require('../models/project');
const User = require('../models/user');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/project', verifyToken, (req, res) => {

    let from = req.query.from;
    let limit = req.query.limit;

    Project.find({})
        .skip(from)
        .limit(limit)
        .populate('participants', 'name')
        .exec((err, projectsDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!projectsDb) {
                return res.status(404).json({ ok: false, message: 'There are no projects in DB' })
            }
            res.status(200).json({ ok: true, projectsDb })
        })
})


app.post('/project', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let userOnline = req.usuario.userDb

    let project = new Project({
        name: body.name,
        description: body.description,
    })
    project.participants.push(userOnline._id)
    project.administrators.push(userOnline._id)

    project.save((err, projectSaved) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        User.update({ id: userOnline._id }, { $push: { projects: projectSaved._id } })
            .exec((err, userDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, mensaje: err }))
                }
                if (!userDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no users with the ID provided' }))
                }
                res.status(200).json({ ok: true })
            })
    })
})

app.put('/addOrPushOutParticipant/:id', [verifyToken, verifyRole], (req, res) => {

    let participantId = req.body.participant;
    let id = req.params.id;

    Project.findById(id, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        let request;
        if (projectDb['participants'].indexOf(participantId) < 0) {
            projectDb.participants.push(participantId)
            request = User.update({ id: participantId }, { $push: { projects: projectDb._id } })
        } else {
            projectDb.participants = projectDb.participants.filter((participant) => { return participant != participantId })
            request = User.update({ id: participantId }, { $pull: { projects: projectDb._id } })
        }
        request.exec((err, userUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!userUpdated) {
                return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
            }
            projectDb.save((err, projectSaved) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true })
            })
        })
    })
})

app.put('/project/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Project.findById(id, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        projectDb.name = body.name;
        projectDb.description = body.description;
        projectDb.save((err, projectUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, projectUpdated })
        })
    })
})

app.put('/addOrDeleteAdmin/:id', [verifyToken, verifyRole], (req, res) => {

    let participantId = req.body.participant;
    let id = req.params.id;

    Project.findById(id, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        let request;
        if (projectDb.administrators.indexOf(participantId) < 0) {
            request = Project.update({ id: projectDb._id }, { $push: { administrators: participantId } })
        } else {
            request = Project.update({ id: projectDb._id }, { $pull: { administrators: participantId } })
        }
        request.exec((err) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true })
        })
    })
})
app.put('/changeStatus/:id', (req, res) => {

    let id = req.params.id;
    Project.findById(id, (err, projectDb) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        let request;
        if (projectDb.activo === true) {
            request = Project.findByIdAndUpdate(projectDb._id, { active: false })
        } else {
            request = Project.findByIdAndUpdate(projectDb._id, { active: true })
        }
        request.exec((err) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true })
        })
    })
})


module.exports = app;