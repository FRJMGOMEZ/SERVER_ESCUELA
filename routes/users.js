const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Project = require('../models/project');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();

app.get('/users', verifyToken, (req, res) => {

    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.limit) || 5;

    User.find({ $nor: [{ _id: req.user.userDb._id }] })
        .skip(from)
        .limit(limit)
        .populate('projects', 'name _id description img')
        .populate('img')
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
            User.countDocuments({ $nor: [{ _id: req.user.userDb._id }] }, (err, count) => {
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

app.put('/changePassword/:password1/:password1', verifyToken, (req, res) => {
    ///////Encriptar password///
    let id = req.params.id;
    let password1 = req.params.password1;
    let password2 = req.params.password2

    let userOnline = req.user.userDb;
    if (!bcrypt.compareSync(password1, userOnline.password)) {
        res.json({ message: 'The passwords do not match' })
    } else {
        userOnline.password = bcrypt.hashSync(password2, 10);
        userOnline.save(() => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.status(200).json({ ok: true })
        })
    }
})

app.post('/user', (req, res) => {

    let body = req.body;
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        status: false,
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

app.put('/changeRole/:id/:role', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let newRole = req.params.role;

    User.findByIdAndUpdate(id, { role: newRole }, (err, userDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!userDb) {
            return res.status(404).json({
                ok: false,
                message: 'No users have been found'
            })
        }
        res.status(200).json({ ok: true })
    })
})

app.put('/user/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'No users have been found'
            })
        }
        if (body.img) { user.img = body.img }
        if (body.name) { user.name = body.name }
        if (body.email) { user.email = body.email }

        user.save((err, userDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            user.populate('img')
                .populate({ path: 'projects', select: 'name _id description img' }, (err, userSaved) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        })
                    }
                    if (!userSaved) {
                        return res.status(404).json({
                            ok: false,
                            message: 'TNo users have been found'
                        })
                    }
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
                return res.status(404).json({ ok: false, message: 'No users have been found' })
            }
            let request;
            switch (userDb.status) {
                case true:
                    request = User.findByIdAndUpdate(id, { status: false }, { new: true });
                    break;
                case false:
                    request = User.findByIdAndUpdate(id, { status: true }, { new: true });
            }
            request.exec((err, userDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!userDb) {
                    return res.status(404).json({ ok: false, message: 'No users have been found' })
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
            return res - status(404).json({ ok: false, message: 'No users have been found' })
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



module.exports = app