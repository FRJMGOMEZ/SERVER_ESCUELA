const User = require('../models/user');
const jwt = require('jsonwebtoken');

let usersConnected = []

const checkUsersOn = (req, res, next) => {
    let userId=req.body.userId;
    if(usersConnected.includes(userId)){
        res.json({message:'El usuario esta actualmente siendo utilizado, disculpa las molestias'})
    }else{
        addUser(userId);
        next();
    }
}

const addUser = (user) => {
    usersConnected.push(user)
}

const removeUser = (user) => {
    usersConnected = usersConnected.filter(usersIn => {
        return usersIn != user
    });
}

const getUsers = ()=>{
    return usersConnected
}

const assignUser=(req,res,next)=>{
    console.log(usersConnected);
    if(req.body.userId === 'noUser' || req.get('token') === 'noToken' ){
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



module.exports = { addUser, removeUser, checkUsersOn,getUsers,assignUser}