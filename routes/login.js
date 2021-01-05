const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyStatus } = require('../middlewares/auth');
const app = express();
const { checkUsersOn,assignUser} = require('../middlewares/checkUsersConnected');
var atob = require('atob');
const User = require('../models/user');
const Visit = require('../models/visit');

app.post('/login', async(req, res) => {
    let credentials= req.body;
    User.findOne({email:credentials.email})
        .populate('img')
        .exec(async(err,userDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        if(!userDb){
            return res.status(404).json({ok:false,message:'Credenciales no válidas'})
        }
        if (!bcrypt.compareSync(credentials.password, userDb.password)) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        message: "Credenciales no válidas"
                    });
        }
        userDb.password = ':)';
            let token = await jwt.sign({ userDb }, '184FG32Di124', { expiresIn: 432000 });
         res.status(200).json({
           ok: true,
           user: userDb,
           _id: userDb._id,
           token
      })
       sumVisit(credentials);
   })
})

const sumVisit = (credentials)=>{
    if (credentials.email != 'frjmartinezgomez@gmail.com') {
        let visit = new Visit({ email: credentials.email })
        visit.save((err, visitDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
        })
    }
}

app.put('/checkToken',[assignUser,checkUsersOn],(req, res) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED,async(err, data) => {
        if (err) {
            return res.json({message:'Vuelva a intentar validarse, por favor'});
        }
        if(!data){
            return res.json({ message: 'Vuelva a intentar validarse, por favor' })
        }
        let userDb = await data.userDb;
        let payload = await JSON.parse(atob(token.split('.')[1]));
        verifyUpdate(payload.exp,userDb,token).then((tokenToGo)=>{
            if (userDb.email === 'frjmartinezgomez@gmail.com') {
                process.env.DEVELOPER = true;
            } else {
                process.env.DEVELOPER = false;
            }
            res.status(200).json({token:tokenToGo })
        })
    })
})

const verifyUpdate=(dateExp,userDb,token)=> {
    return new Promise(async(resolve, reject) => {
        let tokenExp = new Date(dateExp * 1000);
        let now = new Date();
        now = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + now.getTimezoneOffset())
        now.setTime(now.getTime() + 3600000 * 10)
        if (tokenExp.getTime() < now.getTime()) {
            let newtoken = await jwt.sign({ userDb }, process.env.SEED, { expiresIn: 432000 });
            resolve(newtoken)           
        } else {
            resolve(token)
        }
    })
}


module.exports = app;