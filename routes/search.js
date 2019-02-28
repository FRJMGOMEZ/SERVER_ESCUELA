const express = require('express');
const Alumni = require('../models/alumni');
const User = require('../models/user');
const Professor = require('../models/professor');
const Subject = require('../models/subject');
const Indexcard = require('../models/indexcard');
const Project = require('../models/project');
const Week = require('../models/week');
const Event = require('../models/event');
const Day = require('../models/day');
const Facilitie = require('../models/facilitie');

const app = express()

app.get('/search/:collection/:search', (req, res) => {

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
        countItems(collection).then((count) => {
            res.status(200).json({
                ok: true,
                [collection]: response,
                count
            })
        })
    })


})

const countItems = (collection) => {

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
        request.count((err, count) => {
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


app.get('/searchById/:collection/:id', (req, res) => {

    let collection = req.params.collection;
    let id = req.params.id;

    let promise;
    switch (collection) {
        case 'alumni':
            promise = searchAlumniById(res, id);
            break;
        case 'professor':
            promise = searchProfessorById(res, id);
            break;
        case 'user':
            promise = searchUserById(res, id);
            break;
        case 'indexcard':
            promise = searchIndexcardById(res, id);
            break;
        case 'project':
            promise = searchProjectById(res, id);
            break;
        case 'subject':
            promise = searchSubjectById(res, id);
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
        case 'facilitie':
            promise = searchFacilitieById(res, id);
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

const searchAlumniById = (res, id) => {
    return new Promise((resolve, reject) => {
        Alumni.findById(id)
            .populate('subjects', 'name')
            .exec((err, alumniDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!alumniDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no alumnis with the ID provided' }))
                }
                resolve(alumniDb)
            })
    })
}

const searchProfessorById = (res, id) => {

    return new Promise((resolve, reject) => {
        Professor.findById(id, (err, professorDb) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!professorDb) {
                reject(res.status(404).json({ ok: false, message: 'There are no alumnis with the ID provided' }))
            }
            resolve(professorDb)
        })
    })
}
const searchUserById = (res, id) => {

    return new Promise((resolve, reject) => {
        User.findById(id)
            .populate('projects', 'name _id description img active')
            .exec((err, userDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!userDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no users with the ID provided' }))
                }
                resolve(userDb)
            })
    })
}

const searchIndexcardById = (res, id) => {

    return new Promise((resolve, reject) => {
        Indexcard.findById(id, (err, indexcardDb) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!indexcardDb) {
                reject(res.status(404).json({ ok: false, message: 'There are no indexcards with the ID provided' }))
            }
            resolve(indexcardDb)
        })
    })
}


const searchSubjectById = (res, id) => {

    return new Promise((resolve, reject) => {
        Subject.findById(id)
            .exec((err, subjectDb) => {
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                if (!subjectDb) {
                    reject(res.status(404).json({ ok: false, message: 'There are no subjects with the ID provided' }))
                }
                resolve(subjectDb)
            })
    })
}


const searchProjectById = (res, id) => {

    return new Promise((resolve, reject) => {
        Project.findById(id)
            .populate('participants', 'name _id')
            .populate('administrators', 'name _id')
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

        Event.findById(id)
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


const searchFacilitieById = (res, id) => {

    return new Promise((resolve, reject) => {
        Facilitie.findById(id, (err, facilitieDb) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            if (!facilitieDb) {
                reject(res.status(404).json({ ok: false, message: 'There are no facilities with the ID provided' }))
            }
            resolve(facilitieDb)
        })
    })
}



module.exports = app;