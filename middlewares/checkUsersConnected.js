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
            console.log(usersConnected)
            if (usersConnected.indexOf(userDb._id) >= 0 && process.env.DEMO) {
                let message = `El usuario ${userDb.name} modo DEMO está siendo usado, prueba a loggearte con otro usuario, gracias.`
                res.status(200).json({ message })
            } else {
                req.userDb = userDb
                next()
            }
        })
}

module.exports = { usersConnected, checkUsersOn }