const express = require('express');
const bcrypt = require('bcrypt');

const Usuario = require('../models/usuario');
const Proyecto = require('../models/proyecto');

const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express();


app.get('/usuario', verifyToken, (req, res) => {

    let desde = req.query.desde || 0;

    let limite = req.query.limite || 5;

    Usuario.find({})
        .skip(desde)
        .limit(limite)
        .populate('proyectos', 'nombre')
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

        if (body.nombre) {
            usuario.nombre = body.nombre;
        }
        if (body.email) {
            usuario.email = body.email
        }

        if (body.contraseña) {
            usuario.contraseña = bcrypt.hashSync(body.contraseña, 10)
        }
        if (body.rol) {
            usuario.rol = body.rol
        }

        usuario.save((err, usuariActualizado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: err
                })
            }
            res.status(200).json({ ok: true, usuariActualizado })
        })
    })
})


app.put('/cambiarEstadoUsuario/:id', [verifyToken, verifyRole], (req, res) => {

    let id = req.params.id;

    Usuario.findById(id, (err, usuarioDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: err
            })
        }

        if (!usuarioDb) {

            return res.status(404).json({ ok: false, mensaje: 'No existe ningún usuario con el id introducido' })
        }

        if (usuarioDb.estado) {

            usuarioDb.estado = false

            Proyecto.update({}, { $pull: { participantes: usuarioDb._id } })
                .exec((err, proyectoActualizado) => {

                    if (err) {

                        return res.status(500).json({ ok: false, mensaje: err })
                    }

                    usuarioDb.save((err, usuarioActualizado) => {

                        if (err) {

                            return res.status(500).json({ ok: false, mensaje: err })
                        }


                        res.status(200).json({ usuarioActualizado, proyectoActualizado })
                    })
                })

        } else {

            usuarioDb.estado = true;


            usuarioDb.save((err, usuarioActualizado) => {

                if (err) {

                    return res.status(500).json({ ok: false, mensaje: err })
                }

                res.status(200).json({ usuarioActualizado })
            })
        }
    })
})


module.exports = app