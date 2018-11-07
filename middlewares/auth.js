const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

/////////////// VERIFICANDO TOKEN ////////////////

let verifyToken = (req, res, next) => {

        let token = req.get('token');

        jwt.verify(token, process.env.SEED, (error, usuarioDecoded) => {

            if (error) {
                return res.status(401).json({
                    ok: false,
                    error: 'Token no válido'
                })
            }
            req.usuario = usuarioDecoded;
            next()
        })

    }
    ///////////////// VERIFICANDO ADMIN ROLE ///////////////

let verifyRole = (req, res, next) => {


    if (req.params.id) {

        if (req.params.id === req.usuario.id) {

            next()
        }
    }


    if (req.usuario.usuario.rol !== 'ADMIN_ROLE' || req.params.id !== req.usuario.id) {

        return res.status(401).json({
            ok: false,
            error: 'Usuario no autorizado. Póngase en contacto con el admnistrador del sistema'
        })
    }
    next()
}

/////////////// VERIFICANDO STATUS DEL USUARIO ///////////////

let verifyStatus = (req, res, next) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (error, usuario) => {

        if (error) {
            res.status(400).json({
                ok: false,
                mensaje: error
            })
        }
        if (!usuario) {
            return res.status(500).json({
                ok: false,
                message: 'No existe ningun usuario'
            })
        }

        if (usuario.estado === true) {

            req.usuario = usuario;

            next()

        } else {
            res.status(401).json({
                ok: false,
                mensaje: `El usuario ${usuario.nombre} no esta habilitado. Póngase en contacto con el admnistrador del sistema`
            })
        }
    })
}

module.exports = { verifyToken, verifyRole, verifyStatus };