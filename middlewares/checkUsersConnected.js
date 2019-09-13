const User = require('../models/user');
const Indexcard = require('../models/card');

let usersConnected = []

const checkUsersOn = (req, res, next) => {
        User.findOne({ email: req.body.email })
            .populate('img')
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
                if (usersConnected.includes(String(userDb._id)) && process.env.DEMO) {
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
}

const removeUser = (user) => {
    usersConnected = usersConnected.filter(usersIn => {
        return usersIn != user
    });
}

module.exports = { addUser, removeUser, checkUsersOn, usersConnected }