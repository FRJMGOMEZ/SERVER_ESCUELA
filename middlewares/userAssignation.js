//// Solo utilizado en la versión DEMO ///
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {addUser,usersConnected} = require('./checkUsersConnected');

const assignUser=(req,res,next)=>{
    if(!req.body.userId || !req.get('token') ){
        User.find({$nor:[{_id:usersConnected}]})
        .populate('img')
        .exec(async(err,usersDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        usersDb = await usersDb.filter((userDb)=>{return userDb.role === 'ADMIN_ROLE'});
        if(usersDb.length === 0){
          return res.json({message:'Disculpa, no hay usuarios disponibles, intentalo más tarde'}) 
        }else{
           let userDb = usersDb[0];
           userDb.password = ':)';
           let tokenToGo = await jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
           addUser(userDb._id);
           res.status(200).json({token:tokenToGo,user:userDb })
        }
    })
    }else{
        next();
    }
}

module.exports = { assignUser}