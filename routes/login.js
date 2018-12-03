const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");

const Usuario = require('../models/usuario');

const { verifyStatus } = require('../middlewares/auth');

const app = express();


app.post('/login', verifyStatus, (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email })
        .populate(`proyectos`, 'nombre _id descripcion img')
        .exec((err, usuarioDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error buscando usuarios'
                })
            }
            if (!usuarioDb) {
                return res.status(400).json({
                    ok: false,
                    message: 'No hay usuarios con los datos introducidos'
                })
            }
            if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        message: "No hay usuarios con los datos introducidos"
                    });
            }
            usuarioDb.password = ':)';
            let token = jwt.sign({ usuarioDb }, process.env.SEED, { expiresIn: 432000 });
            res.status(200).json({
                ok: true,
                usuarioDb,
                id: usuarioDb.id,
                token
            })
        })
})

app.post('/google', async(req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(err => {
            return res
                .status(500)
                .json({ ok: false, message: "Error verificando token" })
        });

    Usuario.findOne({ email: googleUser.email })
        .populate(`proyectos`, 'nombre _id')
        .exec((err, usuarioDb) => {

            if (err) {
                return res.status(500).json({ ok: false, err })
            }

            if (usuarioDb) {
                if (usuarioDb.google === false) {
                    return res.status(405).json({
                        ok: false,
                        message: 'El usuario ya está registrado'
                    })
                }

                if (usuarioDb.estado === true) {

                    let token = jwt.sign({ usuarioDb }, process.env.SEED, {
                        expiresIn: process.env.CADUCIDAD_TOKEN
                    });

                    res.status(200).json({ ok: true, usuarioDb, token });

                } else {

                    return res.status(401).json({ ok: false, mensaje: 'El usuario aún no está activado, contacte con el admnistrador del programa' })
                }

            } else {

                let usuario = new Usuario({
                    nombre: googleUser.name,
                    email: googleUser.email,
                    google: true,
                    password: "=)",
                    img: googleUser.img,
                });

                usuario.save((err, usuarioGuardado) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({
                        ok: false,
                        usuarioGuardado,
                        mensaje: 'Usuario google creado, manténgase a la espera de la habilitación por parte del administrador del sistema'

                    })
                })
            }
        })
})

const client = new OAuth2Client(process.env.CLIENT_ID);

let verify = async(token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture
    };
}

module.exports = app;