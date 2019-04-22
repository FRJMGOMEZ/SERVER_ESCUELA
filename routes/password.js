const express = require('express');

const User = require('../models/user');
const bcrypt = require('bcrypt');
const PasswordGenerator = require('strict-password-generator').default;
const { sendEmail } = require('../utilities/nodeMail');
const { verifyToken } = require('../middlewares/auth')
const { checkDemo } = require('../middlewares/demo');

const app = express();

app.put('/changePassword/:password1/:password2', [checkDemo, verifyToken], (req, res) => {

    let password1 = req.params.password1;
    let password2 = req.params.password2;

    let userOnline = req.user.userDb;

    User.findById(userOnline._id, async(err, userDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!bcrypt.compareSync(password1, userDb.password)) {
            return res.status(404).json({ ok: false, message: 'The passwords do not match' })
        }

        userDb.password = await bcrypt.hashSync(password2, 10);
        userDb.save(() => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.status(200).json({
                ok: true
            })
        })

    })
})

app.put('/forgotPassword/:email', (req, res) => {

    let email = req.params.email;
    var minNum = Math.floor(Math.random() * (10 - 5)) + 10;
    var maxNum = Math.floor(Math.random() * (20 - 10)) + 20;
    const passwordGenerator = new PasswordGenerator();
    const options = {
        upperCaseAlpha: false,
        lowerCaseAlpha: true,
        number: true,
        specialCharacter: false,
        minimumLength: minNum,
        maximumLength: maxNum
    }
    let resetCode = passwordGenerator.generatePassword(options);
    User.findOneAndUpdate({ email }, { password: bcrypt.hashSync(resetCode, 10) }, (err, userDb) => {
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
        if (userDb.status === false) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario no está validado'
            })
        }
        let message = `Este es tu código de reseteo de la cuenta: ${resetCode}`

        if (process.env.DEMO) {
            userDb.email = 'usuariotestcargomusicapp@gmail.com'
            res.status(200).json({ ok: true, message })
        } else {
            sendEmail(res, userDb, message, 'Código de reseteo').then(() => {
                res.status(200).json({ ok: true })
            })
        }
    })
})

app.put('/checkResetCode/:email/:resetCode', (req, res) => {

    let userMail = req.params.email;
    let resetCode = req.params.resetCode;

    User.findOne({ email: userMail }, (err, userDb) => {
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
        if (!bcrypt.compareSync(resetCode, userDb.password)) {
            return res
                .status(400)
                .json({
                    ok: false,
                    message: "El código de reseteo no es válido"
                });
        } else {
            res.status(200).json({ ok: true })
        }
    })
})

app.put('/setNewPassword/:email/:resetCode/:newPassword', (req, res) => {

    let userMail = req.params.email;
    let newPassword = req.params.newPassword;
    let resetCode = req.params.resetCode;

    User.findOne({ email: userMail }, (err, userDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!userDb) {
            return res.status(400).json({
                ok: false,
                message: 'El email no coincide'
            })
        }
        if (!bcrypt.compareSync(resetCode, userDb.password)) {
            return res
                .status(400)
                .json({
                    ok: false,
                    message: "El código de reseteo no es válido"
                });
        } else {
            userDb.password = bcrypt.hashSync(newPassword, 10)
            userDb.save(() => {
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
})

module.exports = app;