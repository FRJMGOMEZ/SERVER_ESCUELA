const { io } = require('../app');

io.on('connection', (client) => {

    client.on('newChatUser', async(user) => {
        io.emit('newChatUser', user)
    })
    client.on('message', async(messageOrder) => {
        io.emit('message', messageOrder)
    })
    client.on('event', async(event) => {
        io.emit('event', event)
    })
    client.on('disconnect', async() => {})
})