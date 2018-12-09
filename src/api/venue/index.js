import {Router} from 'express';
import sessionChecker from '../../session-checker';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import attendees from '../../models/attendees';
import timeTable from '../../models/venueTimeTable';
import applyTable from '../../models/applyVenue';
import paymentLog from "../../models/paymentLog";
import Payments from '../../lib/payments';

export default ({config, db, passport}) => {
    let api = Router();
    const Op = db.Sequelize.Op;
    const eventModel = event(db.sequelize, db.Sequelize);
    const tableModel = timeTable(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const applyModel = applyTable(db.sequelize, db.Sequelize);
    const paymentLogModel = paymentLog(db.sequelize, db.Sequelize);

    venueModel.hasMany(db.venueTimeTable, {foreignKey:'venueId', sourceKey:'idx'});
    tableModel.belongsTo(db.venue, {foreignKey:'venueId', targetKey:'idx'});

    api.post('/create', sessionChecker(), (req, res) => {
        
        venueModel.create({
            uniqueId : req.user.uniqueId,
            type : req.body.type,
            accomodate : req.body.accomodate,
            country : req.body.country,
            state : req.body.state,
            city : req.body.city,
            detail : req.body.detail,
            lat : req.body.lat,
            lng : req.body.lng,
            amenities : req.body.amenities,
            photoUrl : req.body.photoUrl,
            name : req.body.name,
            rules : req.body.rules,
            fee : req.body.fee 
        }).then(function (result){
            res.send(result);
        }).catch(function (err){
            res.send(err);
        });
    });

    api.get('/venuelist', (req, res) =>{
        venueModel.findAll({where:{
            accomodate :{
                [Op.gt] : req.query.seats
            }
        },  
            include : [{model: tableModel, required : false}]
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var list = new Array();
            for(var searchLen = 0; searchLen < Object.keys(result).length; searchLen++){
                var eachVenue = new Object();
                var table = new Object();
                eachVenue = JSON.stringify(result[searchLen]);
                eachVenue = JSON.parse(eachVenue);
                table = eachVenue.venueTimeTables;
                var errstat = 0;
                for(var tableLen = 0; tableLen < Object.keys(table).length; tableLen++){
                    if(table[tableLen].startDate > req.query.startDate){
                        if(table[tableLen].startDate < req.query.endDate){
                            errstat = 1;
                            continue;
                        }
                    }
                    if(table[tableLen].startDate < req.query.startDate && table[tableLen].endDate > req.query.startDate){
                        errstat = 1;
                        continue;
                    }
                }
                if(errstat) continue;
                else list.push(eachVenue);
            }
            res.send(list);
        })
    });

    api.get('/mylist', sessionChecker(), (req, res) =>{
        venueModel.findAll({where:{
            uniqueId : req.user.uniqueId,
            accomodate :{
                [Op.gt] : req.query.seats
            }
        },  
            include : [{model: tableModel, required : false}]
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var list = new Array();
            for(var searchLen = 0; searchLen < Object.keys(result).length; searchLen++){
                var eachVenue = new Object();
                var table = new Object();
                eachVenue = JSON.stringify(result[searchLen]);
                eachVenue = JSON.parse(eachVenue);
                table = eachVenue.venueTimeTables;
                var errstat = 0;
                for(var tableLen = 0; tableLen < Object.keys(table).length; tableLen++){
                    if(table[tableLen].startDate > req.query.startDate){
                        if(table[tableLen].startDate < req.query.endDate){
                            errstat = 1;
                            continue;
                        }
                    }
                    if(table[tableLen].startDate < req.query.startDate && table[tableLen].endDate > req.query.startDate){
                        errstat = 1;
                        continue;
                    }
                }
                if(errstat) continue;
                else list.push(eachVenue);
            }
            res.send(list);
        })
    })

    api.get('/infor/:id', (req, res) =>{
        var venueId = req.params.id;
        venueModel.findOne({where : {idx : venueId}, include : [{model:tableModel, required : false}]}).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            
            var val = {
                "type": result.type,
                "accomodate": result.accomodate,
                "location": {
                    "country": result.country,
                    "state": result.state,
                    "city": result.city,
                    "detailAddress": result.detail,
                    "coordinates": {
                        "lat": result.lat,
                        "lng": result.lng
                    }
                },
                "amenities": result.amenities,
                "rules": result.rules,
                "fee": result.fee,
                "photoUrl": result.photoUrl,
                "name": result.name
            };
            
            res.send(val);
        })
    });

    api.get('/select', sessionChecker(), (req, res) =>{
        var venueId = req.query.venueId;
        var eventId = req.query.eventId;
        venueModel.findAll({where:{
            idx : venueId
        },  
            include : [{model: tableModel, required : false}]
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            for(var searchLen = 0; searchLen < Object.keys(result).length; searchLen++){
                var eachVenue = new Object();
                var table = new Object();
                eachVenue = JSON.stringify(result[searchLen]);
                eachVenue = JSON.parse(eachVenue);
                table = eachVenue.venueTimeTables;
                var errstat = 0;
                for(var tableLen = 0; tableLen < Object.keys(table).length; tableLen++){
                    if(table[tableLen].startDate > req.query.startDate){
                        if(table[tableLen].startDate < req.query.endDate){
                            errstat = 1;
                            continue;
                        }
                    }
                    if(table[tableLen].startDate < req.query.startDate && table[tableLen].endDate > req.query.startDate){
                        errstat = 1;
                        continue;
                    }
                }
                if(eachVenue.uniqueId != req.user.uniqueId) errstat = 1;
                if(errstat){
                    break;
                } 
            }
            if(errstat){
                res.sendStatus(412);
            }
            else{
                eventModel.findOne({
                    where : {idx:eventId}
                }).then(result => {
                    if(result.hostId != req.user.uniqueId) res.send(412);
                    else {
                        eventModel.update({
                            venueId : venueId,
                            status : '0'
                        },{
                            where : {idx : eventId}
                        }).then(result =>{
                            tableModel.create({
                                eventId : eventId,
                                venueId : venueId,
                                startDate : req.query.startDate,
                                endDate : req.query.endDate
                            }).then(res.sendStatus(200)
                            ).catch(err => {
                                res.send(err);
                            })
                        }).catch(err => {
                            res.send(err);
                        })
                    }
                }).catch(err => {
                    res.send(err);
                }) 
            }
        })    
    })

    //venueId가 parameter로 넘어와야함
    api.post('/apply', sessionChecker(), (req, res) =>{
        var venueId = req.query.venueId;
        var eventId = req.query.eventId;

        let payload = req.body;

        venueModel.findAll({where:{
            idx : venueId
        },  
            include : [{model: tableModel, required : false}]
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            for(var searchLen = 0; searchLen < Object.keys(result).length; searchLen++){
                var eachVenue = new Object();
                var table = new Object();
                eachVenue = JSON.stringify(result[searchLen]);
                eachVenue = JSON.parse(eachVenue);
                
                var providerId = eachVenue.uniqueId;
                var errstat = 0;
                
                payload.amount = eachVenue.fee;
                table = eachVenue.venueTimeTables;
                
                for(var tableLen = 0; tableLen < Object.keys(table).length; tableLen++){
                    if(table[tableLen].startDate > req.query.startDate){
                        if(table[tableLen].startDate < req.query.endDate){
                            errstat = 1;
                            continue;
                        }
                    }
                    if(table[tableLen].startDate < req.query.startDate && table[tableLen].endDate > req.query.startDate){
                        errstat = 1;
                        continue;
                    }
                }
                if(errstat) res.Status(412).send({"message":"예약할수 없는 시간입니다."});
                else {
                    paymentLogModel.max("merchant_uid").then(max => {
                        let merchant_uid = max + 1;
                        payload.merchant_uid = merchant_uid;

                        new Payments().requestPayment(payload, (result, response) =>{
                            if (result) {
                                payload.userId = req.user.uniqueId;
                                payload.receipt_url = response.receipt_url;

                                paymentLogModel.upsert(payload).then(result => {
                                    applyModel.create({
                                        venueId : venueId,
                                        eventId : eventId,
                                        status : 1,
                                        hostId : req.user.uniqueId,
                                        providerId : providerId
                                    }).then(()=>{
                                        eventModel.update({
                                            status : '1',
                                            venueId : venueId
                                        }, {
                                            where : {idx:eventId}
                                        }).then(() => {
                                            debugger;
                                            res.status(201).send({
                                                "receipt_url" : response.receipt_url
                                            }).end();
                                        })
                                    })
                                });
                            } else {
                                res.status(403).send({
                                    "message" : payload
                                })
                            }
                        })
                    })
                }
            }
        })
    });

    api.get('/applylist', sessionChecker(), (req, res) =>{
        var userId = req.user.uniqueId;
        applyModel.findAll({
            where : {
                providerId : userId,
                status : '1'
            }
        }).then(result => {
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var list = new Array();
            for(var searchLen = 0; searchLen < Object.keys(result).length; searchLen++){
                var eachApply = new Object();
                eachApply = JSON.stringify(result[searchLen]);
                eachApply = JSON.parse(eachApply);
                list.push(eachApply.eventId);
            }

            eventModel.findAll({
                where : {idx : list}
            }).then(eventlist =>{
                res.send(eventlist);
            }).catch(function(err){
                res.send(err);
            })
        }).catch(function(err){
            res.send(err);
        })
    })
    
    api.get('/accept', sessionChecker(), (req, res) =>{
        var eventId = req.body.eventId;
        applyModel.findOne({
            where : {
                eventId : eventId
            }
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var venueId = result.venueId;
            var providerId = result.providerId;
            if(providerId != req.user.uniqueId) res.sendStatus(412);
            else{
                applyModel.update({
                    status : 0
                }, {
                    where : {eventId : eventId}
                }).then(result =>{
                    eventModel.findOne({
                        where : {idx : eventId}
                    }).then(date =>{
                        date = JSON.stringify(date);
                        date = JSON.parse(date);
                        var startDate = date.startDate;
                        var endDate = date.endDate;
                        eventModel.update({
                            venueId : venueId,
                            status : '0'
                        }, {
                            where : {idx : eventId}
                        }).then(result2 =>{
                            tableModel.create({
                                eventId : eventId,
                                venueId : venueId,
                                startDate : startDate,
                                endDate : endDate
                            }).then(result3 => {
                                res.send(200);
                            }).catch(function(err){
                                res.send(err);
                            })
                        }).catch(function(err){
                            res.send(err);
                        })
                    }).catch(function(err){
                        res.send(err);
                    })
                }).catch(function(err){
                    res.send(err);
                })
            }
        }).catch(function(err){
            res.send(err);
        })
    })

    api.get('/refuse', sessionChecker(), (req, res) =>{
        var eventId = req.query.eventId;
        applyModel.findOne({
            where : {
                eventId : eventId
            }
        }).then(result =>{
            result = JSON.stringify(result);
            result = JSON.parse(result);
            var providerId = result.providerId;
            if(providerId != req.user.uniqueId) res.sendStatus(412);
            else{
                applyModel.update({
                    status : 0
                }, {
                    where : {eventId : eventId}
                }).then(result =>{
                    eventModel.update({
                        status : '2'
                    }, {
                        where : {idx : eventId}
                    }).then(result2 =>{
                        
                        res.send(200);
                    }).catch(function(err){
                        res.send(err);
                    })
                }).catch(function(err){
                    res.send(err);
                })
            }
        }).catch(function(err){
            res.send(err);
        })
    })

    return api;
};


