const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyStatus, verifyToken } = require('../middlewares/auth');
const app = express();
const { checkUsersOn } = require('../middlewares/checkUsersConnected');

app.post('/login', [checkUsersOn, verifyStatus], async(req, res) => {

    let body = req.body;
    let userDb = req.userDb;

    console.log(userDb)

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
})

app.get('/updateToken', verifyToken, async(req, res) => {
    let userDb = req.user.userDb;
    let token = await jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
    res.status(200).json({ ok: true, token })
})

module.exports = app;