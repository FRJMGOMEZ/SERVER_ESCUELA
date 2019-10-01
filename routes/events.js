const express = require('express');
const EventModel = require('../models/event');
const Day = require('../models/day');
const _ = require('underscore')
const { verifyToken, verifyRole } = require('../middlewares/auth');

const app = express()


app.get('/permanentEvents', verifyToken, (req, res) => {
    EventModel.find({ permanent: true }, (err, eventsDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        res.status(200).json({ ok: true, events: eventsDb })
    })
})

app.get('/events/projects/:projectId', verifyToken, (req, res) => {
    let projectId = req.params.projectId;
    EventModel.find({ project: projectId })
        .populate('user')
        .exec((err, events) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, events })
        })
})

app.get('/events', verifyToken, (req, res) => {
    let today = new Date()
    let from = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    from.setTime(from.getTime() - 604800000 * 2);
    EventModel.find({ startDate: { $gte: from } })
        .populate('facilitie', 'name')
        .exec((err, events) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            events.forEach((eachEvent) => {
                if (eachEvent.permanent && eachEvent.endDate === null) {
                    events = events.filter((event) => { return event._id != eachEvent._id })
                }
            })
            res.status(200).json({ ok: true, events })
        })
})

app.post('/event/:dayId/:limitDate', [verifyToken, verifyRole], (req, res) => {

    let dayId = req.params.dayId;

    let body = req.body;
    let event = new EventModel({
        name: body.name,
        description: body.description,
        user: req.user.userDb._id,
        hour: body.hour,
        day: body.day,
        facilitie: body.facilitie,
        duration: body.duration,
        position: body.position,
        repetition: body.repetition,
        startDate: body.startDate,
        endDate: body.endDate,
        permanent: body.permanent,
        project: body.project || null
    })
    event.save((err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        Day.findById(dayId, (err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            if (!eventDb) {
                return res.status(404).json({ ok: false, message: 'Event not found' })
            }

            let to = new Date(Number(req.params.limitDate));
            let from = new Date(dayDb.date)

            let hour = `hour${eventDb.hour}`;

            let request = Day.update({ _id: dayId }, {
                $push: {
                    [hour]: eventDb._id
                }
            });

            let request2 = Day.updateMany({ day: dayDb.day, date: { $gte: from, $lte: to } }, {
                $push: {
                    [hour]: eventDb._id
                }
            });
            if (eventDb.permanent) {
                request2.exec((err, updated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
            } else {

                request.exec((err, updated) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err })
                    }
                    res.status(200).json({ ok: true, event: eventDb })
                })
            }
        })
    })
})

app.put('/event/:id', [verifyToken, verifyRole], async(req, res) => {

    let id = req.params.id;
    let eventEdited = req.body;
    EventModel.findById(id, async(err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        await checkPermanecy(res, eventEdited, eventDb)
        eventDb.name = eventEdited.name
        eventDb.description = eventEdited.description
        eventDb.professors = eventEdited.professors
        eventDb.subjects = eventEdited.subjects
        eventDb.duration = Number(eventEdited.duration);
        eventDb.position = Number(eventEdited.position)
        eventDb.repetition = eventEdited.repetition;
        eventDb.endDate = eventEdited.endDate;
        eventDb.startDate = eventEdited.startDate;
        eventDb.permanent = eventEdited.permanent;
        eventDb.save((err, eventDb) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            res.status(200).json({ ok: true, event: eventDb })
        })

    })
})

const checkPermanecy = async(res, eventEdited, eventDb) => {
    
    let updatedEventEndDate;
    let eventDbEndDate;
    let hour = `hour${parseInt(eventDb.hour)}`;
    let requests=[];

     /////// EVENTO UN SOLO DÍA //////
    if(!eventDb.permanent){
         ///// startDate ////
        if(eventEdited.permanent){
           if(eventEdited.endDate){
              let from = new Date(eventEdited.startDate);
              let to = new Date(eventEdited.endDate);
              requests.push(addEventToDays(res, hour, eventDb, from, to));
           }else{
            let from = new Date(eventEdited.startDate);
            let to = new Date(8630000000000000);
            requests.push(addEventToDays(res, hour, eventDb, from, to));
           }
        }
    }
    
    ///// EVENTO VARIAS SEMANAS /////
    if(eventDb.endDate && eventDb.permanent){
         ///// startDate ////
          if(new Date(eventDb.startDate).getTime() > new Date(eventEdited.startDate).getTime()){
             let to = new Date(eventEdited.startDate);
             let from = new Date(eventDb.startDate);
             requests.push(addEventToDays(res, hour, eventDb, from, to));
          }else if(new Date(eventDb.startDate).getTime() < new Date(eventEdited.startDate).getTime()){
              let from = new Date(eventDb.startDate);
              let to = new Date(eventEdited.startDate);
              requests.push(removeEventFromDays(res, hour, eventDb, from, to));
          }
          /// endDate /////
          if(!eventEdited.permanent){
            let from = new Date(new Date(eventEdited.startDate).getTime()+86400000 );
            let to = new Date(8630000000000000);
             requests.push(removeEventFromDays(res, hour, eventDb, from, to));
          }
          if(eventEdited.permanent && eventEdited.endDate){
             if(new Date(eventDb.endDate).getTime()> new Date(eventEdited.endDate).getTime()){
               let from = new Date(new Date(eventEdited.endDate).getTime()+86400000 );
               let to = new Date(eventDb.endDate);
                requests.push(removeEventFromDays(res, hour, eventDb, from, to));
             } else if (new Date(eventDb.endDate).getTime() < new Date(eventEdited.endDate).getTime()){
                let from = new Date(eventdb.endDate);
                let to = new Date(eventEdited.endDate);
                requests.push(addEventToDays(res, hour, eventDb, from, to));
             }
          }
          if(eventEdited.permanent && !eventEdited.endDate){
              let from = new Date(eventDb.endDate);
              let to =  new Date(8630000000000000);
              requests.push(addEventToDays(res, hour, eventDb, from, to));
          }
    }

    ///// EVENTO DURACIÓN INDEFINIDA ////
    if(eventDb.permanent && !eventDb.endDate){
        ///// startDate ////
          if(new Date(eventDb.startDate).getTime() > new Date(eventEdited.startDate).getTime()){
             let to = new Date(eventEdited.startDate);
             let from = new Date(eventDb.startDate);+
             requests.push(addEventToDays(res, hour, eventDb, from, to));
          }else if(new Date(eventDb.startDate).getTime() < new Date(eventEdited.startDate).getTime()){
              let from = new Date(eventDb.startDate);
              let to = new Date(eventEdited.startDate);
              requests.push(removeEventFromDays(res, hour, eventDb, from, to));
          }
           /// endDate /////
          if(!eventEdited.permanent){
            let from = new Date(new Date(eventEdited.startDate).getTime() + 86400000 );
            let to = new Date(8630000000000000);
             requests.push(removeEventFromDays(res, hour, eventDb, from, to));
          }
          if(eventEdited.permanent && eventEdited.endDate){
             let from = new Date(new Date(eventEdited.endDate).getTime() + 86400000);
             let to = new Date(8630000000000000);
             requests.push(removeEventFromDays(res, hour, eventDb, from, to));
          }
    }

    if(requests.length > 0){
        Promise.all(requests).then(()=>{
              return 
        })
    }else{
        return
    }
}

const removeEventFromDays = (res, hour, eventDb, from, to) => {
    return new Promise((resolve, reject) => {
        Day.updateMany({
            day: eventDb.day,
            date: { $gte: from, $lte: to },
            [hour]: eventDb._id

        }, {
            $pull: {
                [hour]: eventDb._id
            }
        }, (err) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            resolve()
        })
    })
}

const addEventToDays = (res, hour, eventDb, from, to) => {
    return new Promise((resolve, reject) => {
        Day.updateMany({
            day: Number(eventDb.day),
            date: { $gte: from, $lte: to },
        }, {
            $push: {
                [hour]: eventDb._id
            }
        }, (err) => {
            if (err) {
                reject(res.status(500).json({ ok: false, err }))
            }
            resolve()
        })
    })
}

app.put('/pullEvent/:dayId/:eventId', [verifyToken, verifyRole], (req, res) => {
    let dayId = req.params.dayId;
    let eventId = req.params.eventId;
    EventModel.findById(eventId, (err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, message: err })
        }
        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'There are no events with the ID provided' })
        }
        let hour = `hour${eventDb.hour}`
        Day.findByIdAndUpdate(dayId, {
            $pull: {
                [hour]: eventDb._id
            }
        }, (err, dayDb) => {
            if (err) {
                return res.status(500).json({ ok: false, message: err })
            }
            if (!dayDb) {
                return res.status(404).json({ ok: false, message: 'There are no days with the ID provided' })
            }
            let dayDate = new Date(dayDb.date);
            let eventStartDate = new Date(eventDb.startDate);
            let eventEndDate;
            if (eventDb.endDate != null) {
                eventEndDate = new Date(eventDb.endDate)
                if (eventEndDate.getTime() === dayDate.getTime()) {
                    eventDb.endDate = new Date(eventEndDate.getTime() - 604800000)
                }
            }
            if (dayDate.getTime() === eventStartDate.getTime()) {
                eventDb.startDate = new Date(eventStartDate.getTime() + 604800000)
            } else {
                return res.status(200).json({ ok: true, event: eventDb })
            }
            eventDb.save((err, eventSaved) => {
                if (err) {
                    return res.status(500).json({ ok: false, message: err })
                }
                res.status(200).json({ ok: true, event: eventSaved })
            })
        })
    })
})

app.put('/checkPermanentEvents', verifyToken, (req, res) => {

    let myEvent = req.body;
    EventModel.find({ permanent: true, day: myEvent.day, facilitie: myEvent.facilitie }, async(err, eventsDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        let from = myEvent.position;
        let to = myEvent.hour + myEvent.duration;
        let eventsCollapsed = []
        await eventsDb.forEach((event) => {
            if (event.position >= from && event.position < to) {
                if (myEvent._id) {
                    if (event._id != myEvent._id) {
                        eventsCollapsed.push(event)
                    }
                } else {
                    eventsCollapsed.push(event)
                }
            }
        })
        await eventsDb.forEach((event) => {
            if (event.position < from && event.position + event.duration > from && eventsCollapsed.indexOf(event) < 0) {
                if (myEvent._id) {
                    if (event._id != myEvent._id) {
                        eventsCollapsed.push(event)
                    }
                } else {
                    eventsCollapsed.push(event)
                }
            }
        })
        if (eventsCollapsed.length === 0) {
            res.status(200).json({ ok: true, days: [] })
        } else {
            Promise.all([
                checkEventsInDays(eventsCollapsed[0]),
                checkEventsInDays(eventsCollapsed[1]),
                checkEventsInDays(eventsCollapsed[2]),
                checkEventsInDays(eventsCollapsed[3]),
            ]).then((responses) => {
                responses = responses.filter((response) => { return response != undefined })
                let days = []
                responses.forEach((response) => {
                    response.forEach((day) => {
                        if (days.indexOf(day) < 0) {
                            days.push(day)
                        }
                    })
                })

                days = _.sortBy(days, (day) => {
                    return day.date
                })
                res.status(200).json({ ok: true, day: days[1] })
            })
        }
    })
})

const checkEventsInDays = (event) => {
    return new Promise((resolve, reject) => {
        if (event) {
            let hour = `hour${event.hour}`
            Day.find({
                [hour]: event._id
            }).exec((err, days) => {
                if (err) {
                    return res.status(500).json({ ok: false, err })
                }
                resolve(days)
            })
        } else {
            resolve()
        }
    })
}

app.delete('/event/:id', [verifyToken, verifyRole], (req, res) => {
    let id = req.params.id;
    EventModel.findByIdAndDelete(id, (err, eventDb) => {
        if (err) {
            return res.status(500).json({ ok: false, err })
        }
        if (!eventDb) {
            return res.status(404).json({ ok: false, message: 'No events have been found wich matches with the ID provided' })
        }
        let hour = `hour${eventDb.hour}`;
        Day.updateMany({
            [hour]: eventDb._id
        }, {
            $pull: {
                [hour]: eventDb._id
            }
        }, (err, updated) => {
            if (err) {
                return res.status(500).json({ ok: false, err })
            }
            return res.status(200).json({ ok: true, event: eventDb })
        })
    })
})


module.exports = app