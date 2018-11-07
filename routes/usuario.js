const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

// Middlewares
const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();


app.get('/usuario', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Usuario.find({})
        .skip(desde)
        .limit(limite)

    .exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: err
            })
        }
        if (!usuarios) {

            return res.status(404).json({
                ok: false,
                mensaje: 'No existen usuarios en la base de datos'
            })
        }
        res.status(200).json({
            ok: true,
            usuarios
        })
    })
})



app.post('/usuario', (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        contraseña: bcrypt.hashSync(body.contraseña, 10),
        estado: false
    })
    usuario.save((err, usuario) => {
        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: err
            })
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Usuario guardado correctamente y a la espera de habilitación por parte del administrador del sistema',
            usuario
        })
    })
})




app.put('/usuario/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    let estado = req.query.estado;

    let body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: err
            })
        }
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado en la base de datos'
            })
        }

        if (estado) {

            if (estado === 'activar') {
                usuario.estado = true
            } else if (estado === 'desactivar') {
                usuario.estado = false
            } else {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Estado no válido. Solo se permitem los  estados : activar o desactivar'
                })
            }
        } else {
            if (body.nombre) {
                usuario.nombre = body.nombre;
            } else if (body.email) {
                usuario.email = body.email
            } else if (body.contraseña) {
                usuario.contraseña = bcrypt.hashSync(body.contraseña, 10)
            } else if (body.rol) {
                usuario.rol = body.rol
            }
        }

        usuario.save((err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: err
                })
            }
            if (!estado) {
                res.status(200).json({
                    ok: true,
                    mensaje: `Usuario ${usuario.nombre} actualizado correctamente`,
                    usuario,
                })
            }
            if (estado) {

                if (estado === 'activar') {

                    res.status(200).json({
                        ok: true,
                        mensaje: `Usuario ${usuario.nombre} activado correctamente`
                    })
                } else if (estado === 'desactivar') {

                    res.status(200).json({
                        ok: true,
                        mensaje: `Usuario ${usuario.nombre} desactivado correctamente`
                    })
                }
            }
        })
    })
})



module.exports = app