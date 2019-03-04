const express = require('express');

const Project = require('../models/project');
const User = require('../models/user');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/projects', verifyToken, (req, res) => {

    let userOnline = req.user.userDb;
    Project.find({ participants: userOnline._id })
        .exec((err, projectsDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!projectsDb) {
                return res.status(404).json({ ok: false, message: 'There is not part of any project yet' })
            }
            res.status(200).json({ ok: true, projects: projectsDb })
        })
})


app.post('/project', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let userOnline = req.user.userDb

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
        User.findByIdAndUpdate(userOnline._id, { $push: { projects: projectSaved._id } }, (err, userSaved) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: err })
            }
            if (!userSaved) {
                return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
            }
            res.status(200).json({ user: userSaved, project: projectSaved })
        })
    })
})

app.put('/pullOrPushOutParticipant/:id', [verifyToken, verifyRole], (req, res) => {

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
            request = User.findByIdAndUpdate(participantId, { $push: { projects: projectDb._id } })
        } else {
            projectDb.participants = projectDb.participants.filter((participant) => { return participant != participantId })
            request = User.findByIdAndUpdate(participantId, { $pull: { projects: projectDb._id } })
        }
        request.exec((err, userUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!userUpdated) {
                return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
            }
            projectDb.save((err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, user: userUpdated })
            })
        })
    })
})

app.put('/project/:id', [verifyToken, verifyRole], (req, res) => {

    let body = req.body;
    let id = req.params.id;

    Project.findByIdAndUpdate(id, { name: body.name, description: body.description }, { new: true }, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        res.status(200).json({ ok: true, project: projectDb })
    })
})

app.put('/pullOrPushAdmin/:id', [verifyToken, verifyRole], (req, res) => {

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
            request = Project.findByIdAndUpdate(projectDb._id, { $push: { administrators: participantId } })
        } else {
            request = Project.findByIdAndUpdate(projectDb._id, { $pull: { administrators: participantId } })
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