const express = require('express');
const app = express();
const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');

const { verifyToken } = require('../middlewares/auth');

app.get('/tasks', verifyToken, (req, res) => {
    let userOnline = req.user.userDb;
    User.findById(req.user.userDb._id, (err, user) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: err })
        }
        let projects = user.projects.map((project) => { return project._id })
        Task.find({ user: userOnline._id, project: projects }, { ok: false })
            .populate('project', 'name _id')
            .exec((err, tasks) => {
                if (err) {
                    return res.status(500).json({ ok: false, mensaje: err })
                }
                if (!tasks) {
                    return res.status(404).json({ ok: false, message: 'No users have been found' })
                }
                res.status(200).json({ ok: true, tasks })
            })
    })
})

app.get('/tasksByProject/:project', verifyToken, (req, res) => {

    let project = req.params.project;
    Task.find({ project })
        .populate('user')
        .populate('assignedBy')
        .exec((err, tasksDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!tasksDb) {
                return res.status(404).json({ ok: false, message: 'No tasks have been found' })
            }
            res.status(200).json({ ok: true, tasks: tasksDb })
        })
})

app.get('/tasksByUser/:project/:user', verifyToken, (req, res) => {

    let project = req.params.project;
    let user = req.params.user;
    let regExp = new RegExp(user, "i");

    User.find({ name: regExp }, (err, usersDb) => {

        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!usersDb) {
            return res.status(404).json({ ok: false, message: 'No users have been found' })
        }
        let usersId = usersDb.map((user) => { return user._id })

        Task.find({ project, user: usersId })
            .populate('user')
            .populate('assignedBy')
            .exec((err, tasksDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!tasksDb) {
                    return res.status(404).json({ ok: false, message: 'No tasks have been found' })
                }
                res.status(200).json({ ok: true, tasks: tasksDb })
            })
    })
})


app.post('/task', verifyToken, (req, res) => {
    let body = req.body;
    body.dateLimit = new Date(body.dateLimit)
    body.date = new Date(body.date)
    body.dateLimit = new Date(body.dateLimit.getFullYear(), body.dateLimit.getMonth(), body.dateLimit.getDate(), 0, -body.dateLimit.getTimezoneOffset(), 0, 0);
    body.date = new Date(body.date.getFullYear(), body.date.getMonth(), body.date.getDate(), 0, -body.date.getTimezoneOffset(), 0, 0);
    let task = new Task({
        description: body.description,
        assignedBy: req.user.userDb._id,
        user: body.user,
        project: body.project,
        date: body.date,
        dateLimit: body.dateLimit,
        checked: false
    })
    task.save((err) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        task.populate('user').populate({ path: 'assignedBy' }, (err, taskPopulated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Project.findByIdAndUpdate(taskPopulated.project, { $push: { tasks: taskPopulated._id } }, (err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, task: taskPopulated })
            })
        })
    })
})

app.put('/task/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    body.dateLimit = new Date(body.dateLimit);
    body.dateLimit = new Date(body.dateLimit.getFullYear(), body.dateLimit.getMonth(), body.dateLimit.getDate(), 0, -body.dateLimit.getTimezoneOffset(), 0, 0);
    Task.findByIdAndUpdate(id, { dateLimit: body.dateLimit, description: body.description }, { new: true })
        .populate('user')
        .populate('assignedBy')
        .exec((err, task) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }

            if (!task) {
                return res.status(404).json({ ok: false, message: 'There are no tasks with the ID provided' })
            }
            res.status(200).json({ ok: true, task })
        })
})

app.put('/checkTask/:taskId', verifyToken, (req, res) => {
    let taskId = req.params.taskId;
    Task.findByIdAndUpdate(taskId, { checked: true }, { new: true })
        .populate('user')
        .populate('assignedBy')
        .exec((err, task) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!task) {
                return res.status(404).json({ ok: false, message: 'There are no tasks with the ID provided' })
            }
            res.status(200).json({ ok: true, task })
        })
})

app.put('/taskDone/:taskId', verifyToken, (req, res) => {
    let taskId = req.params.taskId;

    let request;

    Task.findById(taskId, (err, taskDb) => {

        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!taskDb) {
            return res.status(404).json({ ok: false, message: 'There are no tasks with the ID provided' })
        }
        if (taskDb.ok) {
            taskDb.ok = false;
        } else {
            taskDb.ok = true
        }

        taskDb.save((err) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }

            taskDb.populate('user')
                .populate({ path: 'assignedBy' }, (err, task) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    if (!task) {
                        return res.status(404).json({ ok: false, message: 'There are no tasks with the ID provided' })
                    }
                    res.status(200).json({ ok: true, task })

                })
        })
    })
})

app.delete('/task/:id', (req, res) => {
    let id = req.params.id;
    Task.findByIdAndDelete(id, (err, task) => {

        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!task) {
            return res.status(404).json({ ok: false, message: 'There are no tasks with the ID provided' })
        }
        res.status(200).json({ ok: true, task })
    })
})

module.exports = app;