const express = require('express');

const app = express();

const Pago = require('../models/pago');
const Profesor = require('../models/profesor');

const { verifyToken } = require('../middlewares/auth');
const timeStamp = require('../middlewares/timeStamp');


app.post('/pago', [verifyToken, timeStamp], (req, res) => {

    let body = req.body;
    let timeStamp = req.timeStamp;
    let acreedorId = req.body.acreedor;

    let pago = new Pago({
        importe: body.importe,
        concepto: body.concepto,
        clase: body.clase,
    })

    /// Hacer funcion??
    if (pago.concepto === 'ordinario') {
        let date = new Date()
        date += new Date().getMonth + 1;
        pago.fechaDevengo = date;
    }

    pago.usuarios.push(timeStamp)

    comprobarAcreedor(res, acreedorId, pago.clase).then((data) => {


        let res = data.res;
        let acreedor = data.acreedor;

        pago.acreedor = data.acreedor._id;
        pago.save((err, pago) => {

            if (err) {

                return res.status(500).json({ ok: false, mensaje: err })
            }

            acreedor.pagosPendientes.push(pago._id);

            acreedor.save((err, acreedorActualizado) => {

                if (err) {

                    return res.status(500).json({ ok: false, mensaje: err })
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Pago creado',
                    pago,
                    acreedor: acreedorActualizado.nombre
                })

            })
        })
    })

    .catch(err => { throw err })
})


let comprobarAcreedor = (res, acreedorId, clase) => {

    if (clase === 'profesor') {

        return new Promise((resolve, reject) => {

            Profesor.findById(acreedorId, (err, acreedor) => {

                if (err) {

                    reject(res.status(400).json({ ok: false, mensaje: err }))
                }

                if (!acreedor) {

                    reject(res.status(404).json({ ok: false, mensaje: 'Profesor no encontrado' }))
                }

                resolve({ acreedor, res })
            })
        })
    }
}


let asignarPago = (res, acreedor) => {

    return new Promise((resolve, reject) => {

    })
}

module.exports = app;