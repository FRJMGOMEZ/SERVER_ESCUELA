
const express = require('express');
const app = express();
const Payment = require('../models/payment');
const Income = require('../models/income');
const Artist = require('../models/artist');
const Track = require('../models/track');
const Indexcard = require('../models/card');
const Letter = require('../models/letter');
const {sendEmail} = require('../utilities/nodeMail');
const {verifyToken,verifyRole} = require('../middlewares/auth');

app.post('/payments/:trackId/:amount',[verifyToken,verifyRole],async(req,res)=>{

 let trackId = req.params.trackId;
 let amountAssigned = req.params.amount;

 Track.findById(trackId)
 .populate('assignations')
 .exec(async(err,trackDb)=>{
   if(err){
       return res.status(500).json({ok:false,err})
   }
   if(!trackDb){
       return res.status(404).json({ok:false,message:'No tracks have been found'})
   }
   let requests=[];
   let cargoPaymentPercent = 1;
   await trackDb.assignations.forEach(async(assignation)=>{
     let payment = new Payment({amount:amountAssigned*(assignation.percent/100),track:trackDb._id,artist:assignation.artist});
     cargoPaymentPercent-=assignation.percent/100;
     requests.push(postPayment(res,payment))
   })
   let cargoPayment = await new Payment({amount:amountAssigned*cargoPaymentPercent,track:trackDb._id,artist:undefined})
   requests.push(postPayment(res,cargoPayment));
   Promise.all(requests).then(async(payments)=>{
     payments = await payments.filter((payment)=>{return payment.artist != undefined});
     res.status(200).json({ok:true,payments})
   })
 })
})

const postPayment = (res,payment)=>{
    return new Promise((resolve,reject)=>{        
        let newPayment = new Payment({amount:payment.amount,track:payment.track,artist:payment.artist,date:new Date()});
        if(payment.artist != undefined){
            newPayment.sent = false;
        }
        newPayment.save((err, paymentSaved) => {
            if (err) {
                reject(res.status(500).json({ok:false,err}))
            }
            Artist.findByIdAndUpdate(payment.artist,{$push:{payments:paymentSaved._id}})
            .populate('indexcard')
            .exec((err,artistDb)=>{
                if (err) {
                    reject(res.status(500).json({ ok: false, err }))
                }
                paymentSaved.artist = artistDb;
                newPayment.populate({path:'artist',populate:{path:'indexcard'}},(err,paymentPopulated)=>{
                    if (err) {
                        reject(res.status(500).json({ ok: false, err }))
                    }
                    resolve(paymentPopulated)
                })
            })
        })
    })
}

app.put('/paymentLiquidation/:paymentId',()=>{
    let paymentId = req.params.paymentId;
    Payment.findByIdAndUpdate(paymentId,{sent:true},{new:true},(err,paymentUpdated)=>{
        if (err) {
            return res.json(500).json({ ok: false, err })
        }
        if (!paymentUpdated) {
            return res.status(404).json({ ok: false, message: 'No payments have been found' })
        }
        res.status(200).json({ok:true})
    })
})

app.get('/payments',[verifyToken,verifyRole],(req,res)=>{

    let from = Number(req.query.from);
    let payments = req.query.paymentTypes;
    
    let conditions;
    if (payments.indexOf('sent')>=0) {
        let sent = true;
        conditions = { $nor: [{ artist: null }], sent }
    } else if (payments.indexOf('notSent')>=0) {
        let sent = false;
        conditions = { $nor: [{ artist: null }], sent }
    } else if(payments.indexOf('CARGO')>=0) {
        conditions = {  artist: null  };
    } else if (payments.indexOf('all') >= 0) {
        condition={}
    }
 
    Payment.countDocuments(conditions,async(err,count)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        let skip = await count-from-5 >0 ? count-from-5  : 0;
        let limit = await (count - from) < 5 ? count-from : 5;

        Payment.find(conditions)
               .skip(skip)
               .limit(limit)
               .populate({path:'artist',populate:{path:'indexcard'}})
               .populate('track')
               .exec((err,paymentsDb)=>{
                 if (err) {
                    return res.status(500).json({ ok: false, err })
                 }
                 res.status(200).json({ok:true,payments:paymentsDb,count})
               })
    })
})

app.get('/searchPayments/:inputs',async(req, res) => {

    let inputs = req.params.inputs.split(',');
    let from = Number(req.query.from);
    let payments= req.query.paymentTypes;

    let request = await getSearchRequest(res,payments,inputs);

    Payment.countDocuments(request,async(err,count)=>{

        if (err) {
            return res.status(500).json({ ok: false, err })
        }

        let skip = await count - from - 5 > 0 ? count - from - 5 : 0;
        let limit = await (count - from) < 5 ? count - from : 5;

        Payment.find(request)
            .skip(skip)
            .limit(limit)
            .populate('track')
            .populate({ path: 'artist', populate: { path: 'indexcard' } })
            .exec((err, paymentsDb) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                res.status(200).json({ ok: true, payments: paymentsDb, count })
            })
    })
})

app.get('/getPaymentsData/:inputs', async (req, res) => {
    let inputs = req.params.inputs.split(',');
    let payments = req.query.paymentTypes;

    let request = await getSearchRequest(res, payments, inputs);

    Payment.find(request)
        .exec(async (err, paymentsDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            let data = await paymentsDb.map((payment) => { return { amount: payment.amount, date: payment.date } });
            res.status(200).json({ ok: true, data })
        })
})

const getSearchRequest = (res,payments,inputs)=>{
    return new Promise(async(resolve,reject)=>{
        let request;

        let amount = await checkInputsConditions(res, inputs);
        let date = await checkInputsConditions(res, inputs); 
        let artist = await checkInputsConditions(res, inputs);
    
        amount = amount.amount!=undefined ? amount.amount : { $gte: 0 } ;
        date = date.date!=undefined ? date.date : { $gte: new Date(0,0,0,0,0,0,0) } ;
        artist = artist.artist != undefined ? artist.artist : undefined ;

        if(payments.indexOf('all')>=0){
           request = {amount,date};
        }else{
            if(payments.indexOf('CARGO')>=0){
                if(payments.indexOf('sent')>=0 || payments.indexOf('notSent')>=0){
                    if (payments.indexOf('sent') < 0) {
                        request = { amount, date, $or:[{sent: false}, {sent:null}]}
                    }
                    else if (payments.indexOf('notSent') < 0) {
                        request = { amount, date, $or: [{ sent: true }, { sent:null }] }
                    }else{
                        request = { amount, date }
                    }
                }else{
                    request = { amount, date, artist: null }
                }
            }else{
                if (payments.indexOf('sent') >= 0 && payments.indexOf('notSent') >= 0) {
                    request = { amount, date, $nor: [{ artist: null }] }  
                }else{
                    if (payments.indexOf('sent') < 0) {
                        if(artist){
                            request = { sent: false, artist }
                        }else{
                            request = { amount, date, sent: false, $nor: [{ artist: null }] }
                        }
                    }
                    else if (payments.indexOf('notSent') < 0) {
                        if(artist){
                            request = { sent: true, artist }
                        }else{
                            request = { amount, date, sent: true, $nor: [{ artist: null }] }
                        }
                    }
                }
            }
        }
        resolve(request)
    })
}

const checkInputsConditions=(res,inputs)=>{
    return new Promise(async(resolve,reject)=>{
        let condition;
        if (inputs.length != 1) {
            if (inputs[0].length === 13) {
                let date1 = await new Date(Number(inputs[0]));
                let date2 = await new Date(Number(inputs[1]));
                condition = await { date: { $gte: date1, $lte: date2 } };
                resolve(condition);
            } else {
              condition = await { amount: { $gte: Number(inputs[0]), $lte: Number(inputs[1]) }};
              resolve(condition);
            }
        } else {
            let artist = await findArtist(res, inputs[0]);
            condition = { artist };
            resolve(condition);
        }
    })
}

const findArtist = (res, artistName) => {
    return new Promise((resolve, reject) => {
        let regExp = new RegExp(artistName, "i");
        Indexcard.findOne({$or: [{ 'name': regExp },{ 'surname': regExp }]},(err,indexcardDb)=>{
            if (err) {
                reject(res.status(500).json({ ok: false, err }))                
            }
            if(!indexcardDb){
                resolve(undefined)
            }else{
                Artist.findOne({ indexcard: indexcardDb._id }, (err, artistDb) => {
                    if (err) {
                        reject(res.status(500).json({ ok: false, err }))
                    }
                    if (!artistDb) {
                        reject(res.status(404).json({ ok: false, message: 'No artists have been found' }))
                    }
                    resolve(artistDb)
                })
            }
        })
    })
}

app.put('/sendPaymentNotification/:paymentId/:letterId',(req,res)=>{

    let id = req.params.paymentId;
    let letterId = req.params.letterId;

    Payment.findById(id)
        .populate('track')
        .populate({path:'artist',populate:{path:'indexcard'}})
        .exec((err, paymentDb)=>{
        if(err){
            return res.status(500).json({ok:false,err})
        }
        if(!paymentDb){
            return res.status(404).json({ok:false,message:"There are no payments with the ID provided"})
        }
        sendPaymentNotification(res,paymentDb,letterId).then(()=>{
            Payment.findByIdAndUpdate(id,{sent:true,sentDate:new Date()},{new:true})
                   .populate('track')
                   .populate({path:'track',populate:{path:'album'}})
                   .populate({ path: 'artist', populate: { path: 'indexcard' } })
                   .exec((err,paymentUpdated)=>{
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                if (!paymentUpdated) {
                    return res.status(404).json({ ok: false, message: "There are no payments with the ID provided" })
                }
                 
                res.status(200).json({ok:true,payment:paymentUpdated})
            })
        })  
    })
})

const sendPaymentNotification = (res,paymentDb,letterId)=>{

    return new Promise((resolve,reject)=>{
        Letter.findById(letterId)
              .populate('user')
              .exec(async(err,letterDb)=>{
                  if (err) {
                      return res.status(500).json({ ok: false, err })
                  }
                  if (!letterDb) {
                      return res.status(404).json({ ok: false, message: "There are no letters with the ID provided" })
                  }
                  let htmlEmail = [];
                  await letterDb.content.forEach((extract) => {
                      if (extract === '') {
                          htmlEmail.push('<br>')
                      } else {
                          extract = `<p>${extract}</p>`;
                          extract = extract.split('\n');
                          extract.forEach((piece,index) => {
                              htmlEmail.push(piece)
                              htmlEmail.push(' ');
                          })
                      }
                  })
                  await htmlEmail.push('<br><br><br>')
                  letterDb.bottom.forEach((extract) => {
                      if (extract === '') {
                          htmlEmail.push('<br>')
                      } else {
                          extract = `<p>${extract}</p>`;
                          extract = extract.split('\n');
                          extract.forEach((piece, index) => {
                              htmlEmail.push(piece)
                              htmlEmail.push(' ');
                          })
                      }
                  })
                  await htmlEmail.forEach(async(extract, index) => {
                      htmlEmail[index] = await extract.replace('[[apellido artista]]', paymentDb.artist.indexcard.surname);
                  })
                  await htmlEmail.forEach(async(extract,index)=>{
                      htmlEmail[index] = await extract.replace('[[nombre artista]]', paymentDb.artist.indexcard.name);
                  })
                  await htmlEmail.forEach(async (extract, index) => {
                      htmlEmail[index] = await extract.replace('[[email artista]]', paymentDb.artist.indexcard.email);
                  })
                  await htmlEmail.forEach(async (extract, index) => {
                      htmlEmail[index] = await extract.replace('[[cantidad liquidación]]', `${paymentDb.amount} euros`);
                  })
                  await htmlEmail.forEach(async (extract, index) => {
                      htmlEmail[index] = await extract.replace('[[título track]]', paymentDb.track.title);
                  })
                  await htmlEmail.forEach(async (extract, index) => {
                      htmlEmail[index] = await extract.replace('[[título album]]', paymentDb.track.album.title);
                  })
                  htmlEmail= await htmlEmail.join(' ');
                  sendEmail(res,paymentDb.artist.indexcard.email,'LIQUIDACIÓN ROYALTIES',letterDb.user.email,'',htmlEmail).then(() => {
                     resolve(htmlEmail)
                  })
              })
    })
}

module.exports = app;