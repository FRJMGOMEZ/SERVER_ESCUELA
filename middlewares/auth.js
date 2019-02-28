const jwt = require('jsonwebtoken');
const User = require('../models/user');

/////////////// VERIFYING TOKEN ////////////////

let verifyToken = (req, res, next) => {

        let token = req.get('token');
        jwt.verify(token, process.env.SEED, (error, userDecoded) => {
            if (error) {
                return res.status(401).json({
                    ok: false,
                    error
                })
            }
            req.user = userDecoded;
            next()
        })

    }
    ///////////////// VERIFYING ADMIN ROLE ///////////////

let verifyRole = (req, res, next) => {

    if (req.user.userDb.role != 'ADMIN_ROLE') {
        if (req.params.id === req.user.userDb._id) {
            next();
            return
        }
        return res.status(401).json({
            ok: false,
            error: 'Access forbidden for this user. Talk to the admnistrator of the program to get access'
        })
    }
    next()
}

/////////////// VERIFYING USER STATUS ///////////////

let verifyStatus = (req, res, next) => {

    let body = req.body;
    User.findOne({ email: body.email }, (error, user) => {
        if (error) {
            res.status(400).json({
                ok: false,
                error
            })
        }
        if (!user) {
            return res.status(500).json({
                ok: false,
                message: 'There are no user with the ID provided'
            })
        }
        if (user.status === true) {
            req.user = user;
            next()
        } else {
            res.status(401).json({
                ok: false,
                message: `User ${user.name} is not enabled. Talk to the admnistrator of the program to get access`
            })
        }
    })
}

module.exports = { verifyToken, verifyRole, verifyStatus };