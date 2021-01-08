const express = require('express');
const Visit = require('../models/visit');
const {verifyToken} = require('../middlewares/auth');

const app = express();

app.get('/api/visitors',verifyToken,(req,res)=>{
   Visit.find({},(err,visitorsDb)=>{
       if(err){
           return res.status(500).json({ok:false,err})
       }
       res.status(200).json({ ok: true, visitors: visitorsDb})
   })
})
app.delete('/api/visitor/:id',(req,res)=>{

    const id = req.params.id;

    Visit.findByIdAndDelete(id,(err,visitorDeleted)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        if(!visitorDeleted){
            return res.status(404).json({ok:false,message:'No hay visitantes con el id proporcionado'})
        }
        res.status(200).json({ok:true,visitor:visitorDeleted})
    })
})


module.exports = app