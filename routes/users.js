const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Project = require('../models/project');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const { checkDemo } = require('../middlewares/demo');

const { sendEmail } = require('../utilities/nodeMail')

const app = express();

app.get('/api/users', [verifyToken,verifyRole], (req, res) => {

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
                if(process.env.DEMO){
                    usersDb = usersDb.filter((user) => { return user.email != 'frjmartinezgomez@gmail.com' })
                }
                res.status(200).json({
                    ok: true,
                    users: usersDb,
                    count
                })
            })
        })
})

app.post('/api/user', checkDemo, (req, res) => {

    let body = req.body;
    let user = new User({
        name:body.name,
        email:body.email,
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
            message: 'Usuario creado y a la espera de habilitación por parte del admnistrador del programa',
        })

    })
})


app.put('/api/changeRole/:id/:role', [checkDemo, verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;
    let newRole = req.params.role;

    User.findByIdAndUpdate(id, { role: newRole })
        .populate('img')
        .exec((err, userDb) => {
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

///CheckDemo//
app.put('/api/user/:id', [checkDemo, verifyToken], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    User.findByIdAndUpdate(id, { img: body.img }, { new: true })
        .populate('img')
        .exec((err, user) => {
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
            res.status(200).json({ ok: true, user })

        })
})



app.put('/api/changeUserStatus/:id', [checkDemo, verifyToken, verifyRole], (req, res) => {

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
            request
                .populate('img')
                .exec((err, userDb) => {
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
                    } else {
                        if (process.env.NODE_ENV != 'desarrollo') {
                            let message = `Tu cuenta en CARGOMUSICADM ha sido habilitada por ${req.user.userDb.name} `
                            sendEmail(res, userDb, message, 'Habilitación de cuenta', 'Activación cuenta').then(() => {
                                res.status(200).json({ ok: true, user: userDb })
                            })
                        } else {
                            res.status(200).json({ ok: true, user: userDb })
                        }
                    }
                })
        })
    } else {
        res.status(403).json({ ok: false, message: 'This action is forbiddden' })
    }
})

app.delete('/api/user/:id', [checkDemo, verifyToken, verifyRole], (req, res) => {

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



module.exports = app;