const { io } = require('../app');

const Users = require('../classes/users');

const users = new Users()

const { crearMensaje } = require('../pluggins/crearMensaje');


io.on('connection', (client) => {

    console.log('Usuario conectado')

    client.on('mensaje', async(data, callback) => {

        console.log(data)

    })

    client.on('disconnect', async() => {

        console.log('Usuario desconectado')
    })

})