const express = require('express');
const Visit = require('../models/visit');
const {verifyToken} = require('../middlewares/auth');

const app = express();

app.get('/visitors',verifyToken,(req,res)=>{
   Visit.find({},(err,visitorsDb)=>{
       if(err){
           return res.status(500).json({ok:false,err})
       }
       res.status(200).json({ ok: true, visitors: visitorsDb})
   })
})


module.exports = app