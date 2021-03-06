const express = require('express');
const app = express();
const Letter = require('../models/letter');
const { verifyToken, verifyRole } = require('../middlewares/auth');

app.get('/api/letters',[verifyToken,verifyRole],(req,res)=>{
    Letter.find({},(err,lettersDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        res.status(200).json({ok:true,letters:lettersDb})
    })
})

app.post('/api/letter', [verifyToken, verifyRole],(req,res)=>{

    let body = req.body;
    let newLetter = new Letter({
        content:body.content,
        bottom:body.bottom,
        user:body.user,
        name:body.name
    })
    newLetter.save((err,newLetter)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        res.status(200).json({ok:true,letter:newLetter})
    })
})

app.put('/api/letter/:id', [verifyToken, verifyRole],(req,res)=>{
    let id = req.params.id;
    let body = req.body;
    Letter.findByIdAndUpdate(id,{content:body.content,bottom:body.bottom,user:body.user,name:body.name},{new:true},(err,letterUpdated)=>{
       if(err){
           return res.status(500).json({ok:false,err})
       }
       if(!letterUpdated){
           return res.status(404).json({ok:false,message:"There are no letters with the ID provided"})
       }
       res.status(200).json({ok:true, letter:letterUpdated})
    })
})



module.exports=app