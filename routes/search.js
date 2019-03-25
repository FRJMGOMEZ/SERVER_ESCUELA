const express = require('express');
const Alumni = require('../models/alumni');
const User = require('../models/user');
const Professor = require('../models/professor');
const Subject = require('../models/subject');
const Indexcard = require('../models/indexcard');
const Project = require('../models/project');
const Week = require('../models/week');
const EventModel = require('../models/event');
const Day = require('../models/day');
const Facilitie = require('../models/facilitie');
const Message = require('../models/message');
const FileModel = require('../models/file');
const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express()

app.get('/search/:collection/:search', [verifyToken, verifyRole], (req, res) => {

    let from = Number(req.query.from);
    let limit = Number(req.query.limit) || 5;
    let collection = req.params.collection;
    let search = req.params.search;

    let regExp = new RegExp(search, "i");

    let promise;

    switch (collection) {
        case 'alumnis':
            promise = searchAlumnis(res, regExp, from, limit);
            break;
        case 'professors':
            promise = searchProfessors(res, regExp, from, limit);
            break;
        case 'users':
            promise = searchUsers(res, regExp, from, limit);
            break;
        default:
            res.status(404).json({ ok: false, message: 'The collection required does not exist' });
            break;
    }

    promise.then((response) => {
        countItems(collection, regExp).then((count) => {
            res.status(200).json({
                ok: true,
                [collection]: response,
                count
            })
        })
    })
})

const countItems = (collection, regExp) => {

    return new Promise((resolve, reject) => {
        let request;
        switch (collection) {
            case 'alumnis':
                request = Alumni;
                break;
            case 'professors':
                request = Professor;
                break;
            case 'users':
                request = User;
                break;
        }
        request.find({ name: regExp }).count((err, count) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            resolve(count)
        })
    })
}


const searchAlumnis = (res, regExp, from, limit) => {

    return new Promise((resolve, reject) => {
        Alumni.find({ name: regExp })
            .skip(from)
            .limit(limit)
            .populate('subjects', 'name _id')
            .exec((err, alumnisDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!alumnisDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no alumnis with the ID provided' }))
                }
                resolve(alumnisDb)
            })
    })
}

const searchProfessors = (res, regExp, from, limit) => {

    return new Promise((resolve, reject) => {
        Professor.find({ name: regExp })
            .skip(from)
            .limit(limit)
            .populate('subjects', 'name _id')
            .exec((err, professorsDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!professorsDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no professors with the ID provided' }))
                }
                resolve(professorsDb)
            })
    })
}
const searchUsers = (res, regExp, from, limit) => {

    return new Promise((resolve, reject) => {
        User.find({ name: regExp })
            .skip(from)
            .limit(limit)
            .exec((err, usersDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!usersDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no professors with the ID provided' }))
                }
                resolve(usersDb)
            })
    })
}


app.get('/searchById/:collection/:id', verifyToken, (req, res) => {

    let collection = req.params.collection;
    let id = req.params.id;

    let promise;
    switch (collection) {
        case 'project':
            promise = searchProjectById(res, id);
            break;
        case 'week':
            promise = searchWeekById(res, id);
            break;
        case 'day':
            promise = searchDayById(res, id);
            break;
        case 'event':
            promise = searchEventById(res, id);
            break;
        case 'file':
            promise = searchFileById(res, id);
            break;
        default:
            res.status(404).json({ ok: false, mensaje: 'The collection searched does not exist' });
            break;
    }
    promise.then((response) => {
        res.status(200).json({
            [collection]: response
        })
    })
})

const searchFileById = (res, id) => {

    return new Promise((resolve, reject) => {

        FileModel.findById(id, (err, file) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!file) {
                reject(res.status(404).json({ ok: false, message: 'There are no files with the ID provided' }))
            }
            resolve(file)
        })
    })
}


const searchProjectById = (res, id) => {
    return new Promise((resolve, reject) => {
        Project.findOne({ _id: id })
            .populate('participants')
            .populate('administrators')
            .populate('messages')
            .populate({
                model: 'Task',
                path: 'tasks',
                populate: {
                    path: 'user assignedBy',
                    model: 'User'
                },
            })
            .populate({
                model: 'Message',
                path: 'messages',
                select: 'file -_id',
                populate: {
                    path: 'file',
                    model: 'FileModel'
                }
            })
            .exec((err, projectDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!projectDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no projects with the ID provided' }))
                }
                resolve(projectDb)
            })
    })
}


const searchWeekById = (res, id) => {
    return new Promise((resolve, reject) => {
        Week.findById(id)
            .populate('monday', 'date _id')
            .populate('tuesday', 'date _id')
            .populate('wednesday', 'date _id')
            .populate('thursday', 'date _id')
            .populate('friday', 'date _id')
            .populate('saturday', 'date _id')
            .populate('sunday', 'date _id').exec((err, weekDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!weekDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no weeks with the ID provided' }))
                }
                resolve(weekDb)
            })
    })
}

const searchDayById = (res, id) => {

    return new Promise((resolve, reject) => {

        Day.findById(id)
            .populate('hour0')
            .populate('hour1')
            .populate('hour2')
            .populate('hour3')
            .populate('hour4')
            .populate('hour5')
            .populate('hour6')
            .populate('hour7')
            .populate('hour8')
            .populate('hour9')
            .populate('hour10')
            .populate('hour11')
            .exec((err, dayDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!dayDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no days with the ID provided' }))
                }
                resolve(dayDb)
            })
    })
}

const searchEventById = (res, id) => {

    return new Promise((resolve, reject) => {

        EventModel.findById(id)
            .populate('facilitie', 'name _id')
            .exec((err, eventDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!eventDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no events with the ID provided' }))
                }
                resolve(eventDb)
            })
    })
}


module.exports = app;