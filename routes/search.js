const express = require('express');
const Alumni = require('../models/alumni');
const User = require('../models/user');
const Professor = require('../models/professor');
const Project = require('../models/project');
const Week = require('../models/week');
const EventModel = require('../models/event');
const Day = require('../models/day');
const FileModel = require('../models/file');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const Task = require('../models/task');
const Album = require('../models/album');
const Track = require('../models/track');
const Artist = require('../models/artist');
const Payment = require('../models/payment');

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
        case 'tasks':
            promise = searchTasks(res, regExp, from, limit);
            break;
        case 'albums':
            promise = searchAlbums(res, regExp, from, limit);
            break;
        case 'tracks':
            promise = searchTracks(res, regExp, from, limit);
            break;
        case 'artists':
            promise = searchArtists(res, regExp, from, limit);
            break;
        case 'payments':
            promise = searchPayments(res, search, from, limit);
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
            case 'albums':
                request = Album;
                break;
            case 'tracks':
                request = Track;
                break;
            case 'artists':
                request = Artist;
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
                    reject(res.status(404).json({ ok: false, message: 'There are no alumnis' }))
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
                    reject(res.status(404).json({ ok: false, message: 'There are no professors' }))
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
            .populate('img')
            .exec((err, usersDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!usersDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no users' }))
                }
                resolve(usersDb)
            })
    })
}

const searchTasks = (res, regExp, from, limit) => {
    return new Promise((resolve, reject) => {
        Task.find({ name: regExp })
            .skip(from)
            .limit(limit)
            .populate('assignedBy')
            .populate('user')
            .exec((err, tasksDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!tasksDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no tasks' }))
                }
                resolve(tasksDb)
            })
    })
}

const searchAlbums = (res, regExp, from, limit) => {
    return new Promise((resolve, reject) => {
        Album.find({ title: regExp })
            .skip(from)
            .limit(limit)
            .populate('tracks')
            .exec((err, albumsDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                resolve(albumsDb)
            })
    })
}

const searchTracks = (res, regExp, from, limit) => {
    return new Promise((resolve, reject) => {
        Track.find({ title: regExp })
            .skip(from)
            .limit(limit)
            .populate('album', 'name _id')
            .populate({
                model: 'Assignation',
                path: 'assignations',
                select: 'percent',
                populate: {
                    path: 'artist',
                    model: 'Artist',
                    select: 'name _id'
                }
            }, (err, tracksDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                resolve(tracksDb)
            })
    })
}

const searchArtists = (res, regExp, from, limit) => {
    return new Promise((resolve, reject) => {
        Artist.find({ name: regExp })
            .skip(from)
            .limit(limit)
            .populate('user', 'name _id')
            .populate({
                path: 'payments',
                model: 'Payment',
                populate: {
                    path: 'track',
                    model: 'Track'
                }
            }).exec((err, artistsDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                resolve(artistsDb)
            })
    })
}

const searchPayments = (res, date, from, limit) => {
    date = new Date(date);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    return new Promise((resolve, reject) => {
        Payment.find({ date: { "$eq": date } })
            .skip(from)
            .limit(limit)
            .populate({
                path: 'tracks',
                model: 'Track',
                populate: {
                    path: 'artists',
                    model: 'Artist'
                }
            })
            .exec((err, artistsDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                resolve(artistsDb)
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
        case 'album':
            promise = searchAlbumById(res, id);
            break;
        case 'track':
            promise = searchTrackById(res, id);
            break;
        case 'artist':
            promise = searchArtistById(res, id);
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
            .populate({
                model: 'User',
                path: 'participants',
                populate: {
                    path: 'img',
                    model: 'FileModel'
                },
            })
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

const searchAlbumById = (res, id) => {

    return new Promise((resolve, reject) => {

        Album.findById(id)
            .populate({
                path: 'tracks',
                model: 'Track',
                slecet: 'title _id',
                populate: {
                    path: 'assignations',
                    model: 'Assignation',
                    populate: {
                        path: 'artist',
                        model: 'Artist'
                    }
                }
            }).exec((err, albumDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!albumDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no albums with the ID provided' }))
                }
                resolve(albumDb)
            })
    })
}

const searchTrackById = (res, id) => {

    return new Promise((resolve, reject) => {

        Track.findById(id)
            .populate('album', 'title _id')
            .populate({
                path: 'assignations',
                model: 'Assignation',
                populate: {
                    path: 'artist',
                    model: 'Artist',
                    populate: {
                        path: 'user',
                        model: 'User',
                        select: 'name_id'
                    }
                },
            }).exec((err, trackDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!trackDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no tracks with the ID provided' }))
                }
                resolve(trackDb)
            })
    })
}

const searchArtistById = (res, id) => {
    return new Promise((resolve, reject) => {
        Artist.findById(id)
            .populate('user', 'name _id')
            .populate({
                path: 'payments',
                model: 'Payment',
                populate: {
                    path: 'track',
                    model: 'Track'
                }
            }).exec((err, artistDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!artistDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no artists with the ID provided' }))
                }
                resolve(artistDb)
            })
    })
}


module.exports = app;