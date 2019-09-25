
const express = require('express');
const app = express();
const Income = require('../models/income');
const { verifyToken,verifyRole } = require('../middlewares/auth');
const Debitor = require('../models/debitor');

app.get('/incomes',[verifyToken,verifyRole],(req,res)=>{

    let incomeType = req.query.incomeType;
    let from = Number(req.query.from);
    let limit = Number(req.query.limit);

    let conditions;

    switch (incomeType ){
        case 'liquidated': conditions = { notLiquidatedAmount: 0 };
        break;
        case 'notLiquidated': conditions = { $nor: [{ notLiquidatedAmount: 0 }] }; 
        break;
        default: conditions = {};
        break;
    }

    Income.find(conditions)
        .skip(from)
        .limit(limit)
        .populate({ path: 'payments', populate: { path: 'artist', populate: { path: 'indexcard' }, $nor: { artist: undefined } } })
        .populate('debitor')
        .exec((err,incomesDb)=>{
            if(err){
               return res.status(500).json({ok:false,err})
            }
            Income.find(conditions)
                  .countDocuments((err,count)=>{
                    if(err){
                      return res.status(500).json({ok:false,err})
                    }
                    res.status(200).json({ ok: true, incomes: incomesDb,count })
            })
        })
})


app.post('/income',[verifyToken,verifyRole],(req,res)=>{
    let debitor = req.body.debitor;
    let income = req.body.income;
    checkDebitor(res,debitor).then((debitorId)=>{
        let newIncome = new Income({amount:Number(income.notLiquidatedAmount),notLiquidatedAmount:Number(income.notLiquidatedAmount),debitor:debitorId,description:income.description});
        newIncome.save((err)=>{
            if (err) {
               return res.status(500).json({ ok: false, err })
            }
               newIncome
               .populate({ path: 'payments', populate: { path: 'artist', populate: { path: 'indexcard' } } })
               .populate({path:'debitor'},(err,incomePopulated)=>{
                   if (err) {
                       return res.status(500).json({ ok: false, err })
                   }
                   res.status(200).json({ ok: true, income: incomePopulated })
               }) 
        })
    })
})

app.put('/income',[verifyToken,verifyRole],(req,res)=>{

    let body= req.body;

    Income.findById(req.body.income._id,async(err,incomeDb)=>{
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        incomeDb.notLiquidatedAmount = body.income.notLiquidatedAmount;
        incomeDb.liquidatedAmount = body.income.liquidatedAmount;
        
        incomeDb.date = body.income.date;
        incomeDb.debitor = body.income.debitor;
        incomeDb.description = body.income.description;

        await body.paymentIds.forEach((paymentId) => {
            incomeDb.payments.push(paymentId)
        })

        //(incomeDb.payments)

        incomeDb.save((err) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            
            incomeDb
            .populate({ path: 'payments', populate: { path: 'artist', populate: { path: 'indexcard' } } })
            .populate({ path: 'debitor' }, (err, incomePopulated) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, income: incomePopulated })

            })
        })
    })
})

const checkDebitor = (res,debitor)=>{
    return new Promise((resolve,reject)=>{
        if (debitor._id) {
            resolve(debitor._id)
        }else{
            let newDebitor = new Debitor({name:debitor.name,nie:debitor.nie});
            newDebitor.save((err,debitorSaved)=>{
                if(err){
                    reject(res.status(500).json({ok:false,err}))
                }
                resolve(debitorSaved._id)
            })
        }
    })
}

app.get('/searchIncomes/:inputs/:incomeType',async(req,res)=>{

    let inputs = req.params.inputs.split(',');
    let from = Number(req.query.from);
    let limit = Number(req.query.limit);
    let incomeType = req.params.incomeType;

    let request = await getSearchRequest(res,inputs,incomeType);

        Income.find(request)
        .skip(from)
        .limit(limit)
        .populate('debitor')
        .populate({ path: 'payments', populate: { path: 'artist', populate: { path: 'indexcard' } } })
        .exec((err, incomesDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            Income.countDocuments(request,(err,incomesCount)=>{
                if (err) {
                return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, incomes: incomesDb,count:incomesCount })
            })
        })
})

app.get('/getIncomesData/:inputs/:incomeType', async (req, res) => {
    let inputs = req.params.inputs.split(',');
    let incomeType = req.params.incomeType;

    let request = await getSearchRequest(res, inputs, incomeType)

    Income.find(request)
        .exec(async(err, incomesDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
        let data = await incomesDb.map((income)=>{return {amount:income.amount,date:income.date}});

         res.status(200).json({ ok: true,data })   
         
        })
})

const getSearchRequest = (res,inputs,incomeType)=>{
    return new Promise(async(resolve,reject)=>{
        let request;
        if (inputs.length != 1) {
            if (inputs[0].length === 13) {
                let date1 = await new Date(Number(inputs[0]));
                let date2 = await new Date(Number(inputs[1]));
                if (incomeType === 'liquidated') {
                    request = { date: { $gte: date1, $lte: date2 }, notLiquidatedAmount: '0' };
                    resolve(request)
                } else if(incomeType === 'notLiquidated') {
                    request = { date: { $gte: date1, $lte: date2 }, $nor: [{ notLiquidatedAmount: '0' }] };
                    resolve(request)
                }else{
                    request = { date: { $gte: date1, $lte: date2 } };
                    resolve(request)
                }
            } else {
                if (incomeType === 'liquidated') {
                    request = { amount: { $gte: Number(inputs[0]), $lte: Number(inputs[1]) }, notLiquidatedAmount: '0' };
                    resolve(request)
                } else if(incomeType === 'notLiquidated') {
                    request = { amount: { $gte: Number(inputs[0]), $lte: Number(inputs[1]) }, $nor: [{ notLiquidatedAmount: '0' }] };
                    resolve(request)
                }else{
                    request = { amount: { $gte: Number(inputs[0]), $lte: Number(inputs[1]) } };
                    resolve(request)
                }
            }
        } else {
            let debitor = await findDebitor(res, inputs[0]);
            if (incomeType === 'liquidated') {
                request = { debitor, notLiquidatedAmount: '0' };
                resolve(request)
            } else if(incomeType === 'notLiquidated') {
                request = { debitor, $nor: [{ notLiquidatedAmount: '0' }] };
                resolve(request)
            }else{
                request = { debitor };
                resolve(request)
            }
        }
    })
}

const findDebitor = (res,debitorName)=>{
    return new Promise((resolve,reject)=>{
       let regExp = new RegExp(debitorName, "i");
       Debitor.findOne({name:regExp},(err,debitorDb)=>{
          if(err){
              reject(res.status(500).json({ok:false, err}))
          }
          if(!debitorDb){
              reject(res.status(404).json({ok:false,message:'No debitors have been found'}))
          }
          resolve(debitorDb)
       })
    })
}
   


module.exports= app;