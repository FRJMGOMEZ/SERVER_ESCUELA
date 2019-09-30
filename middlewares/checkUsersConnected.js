const User = require('../models/user');

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

module.exports = { addUser, removeUser, checkUsersOn,getUsers}