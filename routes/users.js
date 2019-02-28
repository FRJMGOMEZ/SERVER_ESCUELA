const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Project = require('../models/project');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/users', [verifyToken, verifyRole], (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.limit) || 5;

    User.find({ $nor: [{ _id: req.user.userDb._id }] })
        .skip(from)
        .limit(limit)
        .populate('projects', 'name _id description img')
        .exec((err, usersDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!usersDb) {
                return res.status(404).json({
                    ok: false,
                    message: 'There are no user in DB'
                })
            }
            User.count((err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                res.status(200).json({
                    ok: true,
                    users: usersDb,
                    count
                })
            })
        })
})



app.post('/user', (req, res) => {

    let body = req.body;
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        status: false
    })
    user.save((err, userSaved) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        res.status(200).json({
            ok: true,
            message: 'User succesfully saved, wait for the qualification from the admnistrator of the program',
            userSaved
        })
    })
})

app.put('/user/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    User.findById(id, (err, userDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!userDb) {
            return res.status(404).json({
                ok: false,
                message: 'There are no users with the ID provided'
            })
        }
        if (body.name) {
            userDb.name = body.name;
        }
        if (body.email) {
            userDb.email = body.email
        }
        if (body.role) {
            userDb.role = body.role;
        }
        userDb.save((err, userSaved) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            userDb.populate({ path: 'projects', select: 'name _id description img' }, (err, userSaved) => {
                res.status(200).json({ ok: true, user: userSaved })
            })
        })
    })
})


app.put('/changeUserStatus/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    if (String(req.user.userDb.role) === 'ADMIN_ROLE') {
        User.findById(id, (err, userDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!userDb) {
                return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
            }
            let request;
            switch (userDb.status) {
                case true:
                    request = User.findByIdAndUpdate(id, { status: false });
                    break;
                case false:
                    request = User.findByIdAndUpdate(id, { status: true });
            }
            request.exec((err, userDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!userDb) {
                    return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
                }
                if (userDb.status === false) {
                    Project.update({}, { $pull: { participants: userDb._id, admnistrators: userDb._id } })
                        .exec((err) => {
                            if (err) {
                                return res.status(500).json({ ok: false, err })
                            }
                            res.status(200).json({ ok: true, user: userDb })
                        })
                } else { res.status(200).json({ ok: true, user: userDb }) }
            })
        })
    } else {
        res.status(403).json({ ok: false, message: 'This action is forbiddden' })
    }
})

app.delete('/user/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    User.findByIdAndDelete(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!userDeleted) {
            return res - status(404).json({ ok: false, message: 'There are no users with the ID provided' })
        }
        Project.update({}, { $pull: { participants: userDeleted._id, administrators: userDeleted._id } })
            .exec((err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, user: userDeleted })
            })
    })
})

app.get('/user/:id/:password', [verifyToken, verifyRole], (req, res) => {


    ///////Encriptar password///

    let id = req.params.id;
    let password = req.params.password;

    User.findById(id, (err, userDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!userDb) {
            return res.status(404).json({ ok: false, message: 'There are no users with the ID provided' })
        }
        if (!bcrypt.compareSync(password, userDb.password)) {
            res.json({ message: 'The passwords do not match' })
        } else {
            res.json({ ok: true, user: userDb })
        }
    })
})


module.exports = app