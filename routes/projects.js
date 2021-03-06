const express = require('express');
const Project = require('../models/project');
const User = require('../models/user');
const Task = require('../models/task');
const Message = require('../models/message');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const { checkDemo } = require('../middlewares/demo');

const app = express();

app.get('/api/projects', verifyToken, (req, res) => {
    let userOnline = req.user.userDb;
    Project.find({ participants: userOnline._id })
        .exec((err, projectsDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!projectsDb) {
                return res.status(200).json({ ok: true, projects: [] })
            }
            projectsDb.forEach((eachProject) => {
                if (eachProject.administrators.indexOf(userOnline._id) < 0 &&
                    eachProject.status === false) {
                    projectsDb = projectsDb.filter((project) => { return project._id != eachProject._id })
                }
            })
            res.status(200).json({ ok: true, projects: projectsDb })
        })
})

app.post('/api/project', [verifyToken, verifyRole], (req, res) => {
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
        User.findByIdAndUpdate(userOnline._id, { $push: { projects: { _id: projectSaved._id, lastConnection: new Date() } } }, { new: true },(err, userUpdated) => {
                if (err) {
                    return res.status(500).json({ ok: false, mensaje: err })
                }
                if (!userUpdated) {
                    return res.status(404).json({ ok: false, message: 'No users have been found' })
                }
                res.status(200).json({ user: userUpdated, project: projectSaved })
            })
    })
})

app.put('/api/lastConnection/:projectId', verifyToken, (req, res) => {
    let userOnline = req.user.userDb;
    let projectId = req.params.projectId;
    let newProject = { _id: projectId, lastConnection: new Date() }
    User.findOneAndUpdate({ _id: userOnline._id, 'projects._id': projectId }, { $set: { 'projects': newProject } }, { new: true })
        .populate('img')
        .exec((err, userUpdated) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: err })
            }
            if (!userUpdated) {
                return res.status(404).json({ ok: false, message: 'No users have been found' })
            }
            res.status(200).json({ ok: true, user: userUpdated })
        })
})

app.put('/api/project/:id', [verifyToken, verifyRole], (req, res) => {

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

app.put('/api/project/changeStatus/:id', (req, res) => {

    let id = req.params.id;
    Project.findById(id, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        let request;
        if (projectDb.status === true) {
            request = Project.findByIdAndUpdate(projectDb._id, { status: false }, { new: true })
        } else {
            request = Project.findByIdAndUpdate(projectDb._id, { status: true }, { new: true })
        }
        request.exec((err, projectDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, project: projectDb })
        })
    })
})

app.put('/api/pullOrPushOutParticipant/:id', [verifyToken, verifyRole], (req, res) => {

    let participantId = req.body.participant;
    let id = req.params.id;
    Project.findById(id, (err, projectDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDb) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        let newProject = { _id: projectDb._id, lastConnection: new Date() }
        let request;
        if (projectDb['participants'].indexOf(participantId) < 0) {
            projectDb.participants.push(participantId)
            request = User.findByIdAndUpdate(participantId, { $push: { projects: newProject } })
        } else {
            projectDb.participants = projectDb.participants.filter((participant) => { return participant != participantId })
            request = User.findByIdAndUpdate(participantId, { $pull: { 'projects': { '_id': projectDb._id } } })
        }
        request
            .populate('img')
            .exec((err, userUpdated) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!userUpdated) {
                    return res.status(404).json({ ok: false, message: 'No users have been found' })
                }
                projectDb.save((err) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, participant: userUpdated })
                })
            })
    })
})

app.put('/api/pullOrPushAdmin/:id', [verifyToken, verifyRole], (req, res) => {

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
        request
            .exec((err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                User.findById(participantId, (err, userDb) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    if (!userDb) {
                        return res.status(404).json({ ok: false, message: 'No users have been found' })
                    }
                    res.status(200).json({ ok: true, administrator: userDb })
                })
            })
    })
})

app.delete('/api/project/:id', [checkDemo, verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    Project.findByIdAndDelete(id, (err, projectDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!projectDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
        }
        User.updateMany({ projects: projectDeleted._id }, { $pull: { projects: projectDeleted._id } }, (err) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Task.deleteMany({ project: projectDeleted._id }, (err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                Message.find({ project: projectDeleted._id }, (err, messages) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    Message.deleteMany({ project: projectDeleted._id }, (err) => {
                        if (err) {
                            return res.status(500).json({ ok: false, err })
                        }
                        let files = messages.map((message) => { return message.file })
                        res.status(200).json({ ok: true, files, project: projectDeleted })
                    })
                })
            })
        })
    })
})


module.exports = app;