const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { verifyStatus, verifyToken } = require('../middlewares/auth');
const app = express();

const { usersConnected } = require('../sockets/sockets');

app.post('/login', verifyStatus, (req, res) => {
    let body = req.body;
    User.findOne({ email: body.email })
        .populate('img')
        .lean()
        .exec(async(err, userDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!userDb) {
                return res.status(400).json({
                    ok: false,
                    message: 'User not valid'
                })
            }

            if (usersConnected.indexOf(userDb._id) >= 0 && process.env.DEMO) {
                let message = `El usuario ${userDb.name} modo DEMO está siendo usado, prueba a loggearte con otro usuario, gracias.`
                res.status(200).json({ message })
            } else {
                if (!bcrypt.compareSync(body.password, userDb.password)) {
                    return res
                        .status(400)
                        .json({
                            ok: false,
                            message: "User not valid"
                        });
                }
                userDb.password = ':)';
                let token = await jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
                res.status(200).json({
                    ok: true,
                    user: userDb,
                    id: userDb._id,
                    token
                })
            }
        })
})

app.get('/updateToken', verifyToken, async(req, res) => {
    let userDb = req.user.userDb;
    let token = await jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
    res.status(200).json({ ok: true, token })
})

module.exports = app;