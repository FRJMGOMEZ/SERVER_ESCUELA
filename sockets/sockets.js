const { io } = require('../app');

const Users = require('../classes/users');

const Mensaje = require('../models/mensaje');

const users = new Users()

const { crearMensaje } = require('../pluggins/crearMensaje');


io.on('connection', (client) => {

    client.on('mensaje', async(mensaje) => {

        Mensaje.findById(mensaje._id)
            .populate('usuario', 'nombre _id')
            .exec((err, mensajeDb) => {

                if (err) {

                    console.log('error')
                } else {

                    io.emit('mensaje', mensajeDb)
                }
            })
    })

    client.on('disconnect', async() => {

    })

})