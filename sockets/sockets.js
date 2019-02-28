const { io } = require('../app');

const Message = require('../models/message');

io.on('connection', (client) => {

    client.on('message', async(message) => {
        Message.findById(message._id)
            .populate('user', 'name _id')
            .exec((err, messageDb) => {
                if (err) {
                    console.log('error')
                } else {
                    io.emit('message', messageDb)
                }
            })
    })
    client.on('disconnect', async() => {})

})