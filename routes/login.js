const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { verifyStatus } = require('../middlewares/auth');

const app = express();


app.post('/login', verifyStatus, (req, res) => {

    let body = req.body;

    let usuario = req.usuario;

    if (!bcrypt.compareSync(body.contraseña, usuario.contraseña)) {
        return res.status(500).json({
            ok: false,
            message: 'La contraseña es incorrecta'
        })
    }

    let token = jwt.sign({ usuario }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
    res.status(200).json({
        ok: true,
        mensaje: `${usuario.nombre} logeado correctamente`,
        usuario,
        token
    })
})

module.exports = app;