const express = require('express');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const Project = require('../models/project');
const Message = require('../models/message');

const app = express()

app.get('/messages/:id', verifyToken, (req, res) => {

    let projectId = req.params.id;
    let from = Number(req.query.from)

    Message.find({ project: projectId })
        .skip(from)
        .populate('user', 'name _id')
        .exec((err, messagesDb) => {
            if (err) {
                res.status(500).json({ ok: false, err })
            }
            if (!messagesDb) {
                res.status(404).json({ ok: false, message: 'There are no messages in the project' })
            }
            res.status(200).json({ ok: true, messages: messagesDb })
        })
})

app.post('/message', verifyToken, (req, res) => {
    let message = new Message({
        user: req.body.user,
        project: req.body.project,
        message: req.body.message,
        img: req.body.img,
        file: req.body.file,
        title: req.body.title
    })
    message.save((err, messageSaved) => {
        if (err) {
            res.status(500).json({ ok: false, err })
        }
        let toPush = messageSaved.img || messageSaved.file;
        let path;
        if (messageSaved.img) {
            path = 'images';
            toPush = { title: messageSaved.title, image: [toPush] }
        }
        if (messageSaved.file) {
            path = 'files';
            toPush = { title: messageSaved.title, file: [toPush] }
        }

        Project.findByIdAndUpdate(message.project, {
                $push: { messages: messageSaved._id },
                $push: {
                    [path]: [toPush]
                }
            })
            .exec((err, projectDb) => {
                if (err) {
                    res.status(500).json({ ok: false, err })
                }
                if (!projectDb) {
                    res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
                }

                res.status(200).json({ ok: true, message: messageSaved })
            })
    })
})

module.exports = app;