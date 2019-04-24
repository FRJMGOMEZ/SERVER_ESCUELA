const User = require('../models/user');

let usersConnected = []

const checkUsersOn = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .populate('img')
        .lean()
        .exec((err, userDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!userDb) {
                return res.status(400).json({
                    ok: false,
                    message: 'User not valid'
                })
            }
            console.log(process.env.DEMO)
            console.log(usersConnected, userDb._id)
            console.log(usersConnected.indexOf(userDb._id))
            if (usersConnected.indexOf(userDb._id) >= 0 && process.env.DEMO) {
                let message = `El usuario ${userDb.name} modo DEMO está siendo usado, prueba a loggearte con otro usuario, gracias.`
                return res.status(200).json({ message })
            } else {
                req.userDb = userDb
                next()
            }
        })
}

const addUser = (user) => {

    usersConnected.push(user)
    console.log(usersConnected, 'test2')
}

const removeUser = (user) => {
    usersConnected = usersConnected.filter(usersIn => {
        return usersIn != user
    })
}

module.exports = { addUser, removeUser, checkUsersOn }