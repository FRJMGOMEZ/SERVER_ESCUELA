const express = require('express');

const { verifyToken } = require('../middlewares/auth');

const Project = require('../models/project');
const Message = require('../models/message');
const User = require('../models/user');

const app = express()

app.get('/messages/:id', verifyToken, (req, res) => {
    let projectId = req.params.id;
    let from = Number(req.query.from);
    let limit = Number(req.query.limit)
    Message.find({ project: projectId })
        .skip(from)
        .limit(limit)
        .populate({
            path: 'user',
            model: 'User',
            select:'user name _id'
        })
        .populate('file')
        .exec((err, messagesDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!messagesDb) {
                return res.status(404).json({ ok: false, message: 'There are no messages in the project' })
            }
            Message.count({ project: projectId }, (err, count) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, messages: messagesDb, count })
            })
        })
})

app.get('/lastMessages', verifyToken, (req, res) => {
    let userOnline = req.user.userDb;
    let requests = [];
    User.findById(userOnline._id,(err,userDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        if(!userDb){
            return res.status(404).json({ok:false,message:'There are no users with the ID provided'})
        }
      userDb.projects.forEach((project) => {
      requests.push(findMessages(project._id, project.lastConnection, res))
       })
        if (requests.length === 0) {
          return res.status(200).json({ ok: true, messages: [] })
        } else {
          Promise.all(requests).then((responses) => {
            let messages = []
              responses.forEach((response) => {
                response.forEach((message) => {
                 messages.push(message)
              })
            })
           res.status(200).json({ ok: true, messages })
          })
      }
    })    
})

const findMessages = (projectId, userLastConnection, res) => {
    return new Promise((resolve, reject) => {
        if (userLastConnection === null) { resolve() } else {
            userLastConnection = new Date(userLastConnection);
            Message.find({ project: projectId, date: { $gte: userLastConnection } })
                .populate('project', 'name _id')
                .exec((err, messages) => {
                    if (err) {
                        reject(res.status(500).json({ ok: false, err }))
                    }
                    resolve(messages)
                })
        }
    })
}

app.post('/message', verifyToken, (req, res) => {
    let message = new Message({
        user: req.body.user,
        project: req.body.project,
        message: req.body.message,
        file: req.body.file,
        date: new Date()
    })
    message.save((err) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        message.populate({
            path: 'user',
            model: 'User',
            select:'name email _id'
        }).populate({ path: 'file' }, (err, messageDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Project.findByIdAndUpdate(message.project, { $push: { messages: messageDb._id } }, (err, projectDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!projectDb) {
                    res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' })
                }
                res.status(200).json({ ok: true, message: messageDb })
            })
        })
    })
})

app.delete('/message/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    Message.findByIdAndDelete(id, (err, messageDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!messageDeleted) {
            return res.status(404).json({ ok: false, message: 'There are no messages with the ID provided' })
        }
        Project.updateOne({ messages: messageDeleted._id }, { $pull: { messages: messageDeleted._id } }, { new: true }, (err, projectUpdated) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    err
                });
            if (!projectUpdated) {
                return res.status(404).json({ ok: false, message: 'There are no projects with the message provided' })
            }
            res.status(200).json({ ok: true, message: messageDeleted })
        })
    })
})

module.exports = app;