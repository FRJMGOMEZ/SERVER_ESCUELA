const express = require('express');
const app = express();
const Letter = require('../models/letter');

app.get('/letters',(req,res)=>{
    Letter.find({},(err,lettersDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        res.status(200).json({ok:true,letters:lettersDb})
    })
})

app.post('/letter',(req,res)=>{

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

app.put('/letter/:id',(req,res)=>{
    let id = req.params.id;
    let body = req.body;
    Letter.findOneAndUpdate(id,{content:body.content,bottom:body.bottom,user:body.user,name:body.name},{new:true},(err,letterUpdated)=>{
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