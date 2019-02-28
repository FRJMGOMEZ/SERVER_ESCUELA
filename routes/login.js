const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");

const User = require('../models/user');

const { verifyStatus } = require('../middlewares/auth');

const app = express();


app.post('/login', verifyStatus, (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email })
        .populate(`projects`, 'name _id description img')
        .exec((err, userDb) => {
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
            if (!bcrypt.compareSync(body.password, userDb.password)) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        message: "User not valid"
                    });
            }
            userDb.password = ':)';
            let token = jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
            res.status(200).json({
                ok: true,
                user: userDb,
                id: userDb.id,
                token
            })
        })
})

module.exports = app;