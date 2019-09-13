const express = require('express');
const app = express();

const Debitor = require('../models/debitor');

app.get('/debitors',(req,res)=>{
    Debitor.find((err,debitorsDb)=>{      
        if(err){
            return res.status(500).json({ok:false,err})
        }
        res.status(200).json({ok:true,debitors:debitorsDb})
    })
})

module.exports = app;