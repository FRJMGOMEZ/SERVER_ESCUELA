const jwt = require('jsonwebtoken');
const User = require('../models/user');

/////////////// VERIFYING TOKEN ////////////////

let verifyToken = (req, res, next) => {
        let token = req.get('token');
        jwt.verify(token, process.env.SEED, (err, userDecoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    err
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
    let userEmail = req.body.email;
    User.findOne({email:userEmail},(err,userDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        if(!userDb){
            return res.status(404).json({ok:false,message:'No se han encontrado usuarios con las credenciales aportadas'})
        }
        if (userDb.status === true) {
            req.user = userDb;
            next()
            return
        } else {
            return res.status(401).json({
                ok: false,
                message: `User ${userDb.name} is not granted. Talk to the admnistrator of the program to get access`
            })
        }
    })
}

module.exports = { verifyToken, verifyRole, verifyStatus };