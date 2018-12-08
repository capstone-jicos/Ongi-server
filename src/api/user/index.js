import {Router} from 'express';
import sessionChecker from '../../session-checker';
import users from '../../models/users';
import event from '../../models/events';
import venue from '../../models/venue';
import attendees from '../../models/attendees'

export default ({config, db}) => {
    let api = Router();

    var async = require('async');

    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const attendeeModel = attendees(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);

    var userId;

    var eventIndexGlobal = [];

    api.get('/me', sessionChecker(), (req, res) => {
        userModel.findOne({where : {uniqueId : req.user.uniqueId}}).then(userData =>{
        res.send(userData);
        });
    });

    // 주최 리스트 보기
    // 참가 대기중 수 보여주기
    api.get('/me/hosted', sessionChecker(), function(req,res) {  
               
        userId = req.user.uniqueId;

        var hostListJson = {};
        var hostListArr = [];
        
        var eventIndex = [];
        var title = [];
        var description = [];
        var venueId = [];
        var feeAmount = [];
        var eventImages = [];
        var type = [];
        var startDate = [];
        var endDate = [];

        var eventIdNum = [];

        async.series([
            
            function(callback) {
                eventModel.findAll({
                    where: {
                        hostId: userId
                    }
                })
                .then(hostList => {

                    for(var i=0; i<hostList.length; i++) {
                        eventIndex[i] = hostList[i]['idx'];
                        title[i] = hostList[i]['title'];
                        description[i] = hostList[i]['description'];
                        venueId[i] = hostList[i] ['venueId'];
                        feeAmount[i] = hostList[i]['feeAmount'];
                        eventImages[i] = hostList[i]['eventImages'];
                        type[i] = hostList[i]['type'];
                        startDate[i] = hostList[i]['startDate'];
                        endDate[i] = hostList[i]['endDate'];
                    }          
                    callback(null,1);
                })        
            },
            function(callback) {
                attendeeModel.findAll({
                    where: {
                        eventId: eventIndex,
                        attending: 2
                    }
                })
                .then(attendeeList => {
                    for (var j=0; j<eventIndex.length; j++) {
                        eventIdNum[j] = 0;
                    }
                    
                    for (var i=0; i<attendeeList.length; i++) {
                        for (var j=0; j<eventIndex.length; j++) {
                            if (attendeeList[i]['eventId'] == eventIndex[j]) {
                                eventIdNum[j]++;
                                break;

                            }

                        }

                    }
                    callback(null,1);
                })
            }            
        ],
        function() {
            for (var i=0; i<eventIndex.length; i++) {
                
                eventIndexGlobal = eventIndex;
                
                hostListJson = {
                    "eventIndex": eventIndex[i],
                    "title": title[i],
                    "description": description[i],
                    "venueId": venueId[i],
                    "feeAmount": feeAmount[i],
                    "eventImages": eventImages[i],
                    "type": type[i],
                    "startDate": startDate[i],                
                    "endDate": endDate[i],
                    "holdNum": eventIdNum[i]
                }
                hostListArr[i] = hostListJson;
            }
            res.send(hostListArr);
        });

        
    });


    // accept을 기다리는 hold list(id)
    api.get('/me/hosted/:id', sessionChecker(), function(req,res) {
        var eventIndex = req.params.id;

        var attendeeArr = [];
        var attendeeNameArr = [];
        var attendeeImageArr = [];

        var attendeeJson = {};
        var attendeeListArr = [];        
        
        async.series([

            function(callback){
                attendeeModel.findAll({
                    where: {
                        eventId: eventIndex,
                        attending: 2
                    }
                })
                .then(attendeeList => {

                    if (attendeeList.length == 0){
                        res.send({});
                    }

                    for (var i=0; i<attendeeList.length; i++) {
                        attendeeArr[i] = attendeeList[i]['attendeeId'];
                    }
                    callback(null,1);
                })        
            },
            function(callback) {
                userModel.findAll({
                    where: {
                        uniqueId: attendeeArr
                    }
                })
                .then(userList => {
                    for (var i=0; i<attendeeArr.length; i++) {
                        for (var j=0; j<userList.length; j++) {
                            if (attendeeArr[i] == userList[j]['uniqueId']) {
                                attendeeNameArr[i] = userList[j]['displayName'];
                                attendeeImageArr[i] = userList[j]['profileImage'];
                                break;
                            }
                        }
                    }
                    callback(null,1);
                })
            }
            
        ],
        function() {
            for (var i=0; i<attendeeArr.length; i++) {
                
                attendeeJson = {
                    "attendeeId": attendeeArr[i],
                    "attendeeName": attendeeNameArr[i],
                    "attendeeImage": attendeeImageArr[i]
                }
                attendeeListArr[i] = attendeeJson;
            }
            res.send(attendeeListArr);
        });
    });

    // host가 참가자 accept
    api.post('/me/hosted/:id/accepted', sessionChecker(), function(req,res) {
        var eventIndex = req.params.id;
        var uniqueAttendee = req.body.attendeeId;

        var guestEmail,guestName;
        
        async.series([

            function(callback){
                attendeeModel.update(
                    {attending: 1},
                    {
                    where: {
                        eventId: eventIndex,
                        attendeeId: uniqueAttendee
                    }
                }).then(accepted => {
                    callback(null,1);
                })
            },
            function(callback){
                eventModel.findOne({
                    where: {
                        idx: eventIndex
                    }
                }).then(eventMail => {
                    eventTitle = eventMail['title'];
                    eventDesc = eventMail['description'];
                    eventHostId = eventMail['hostId'];
                    eventVenueId = eventMail['venueId'];
                    eventFee = eventMail['feeAmount'];
                    eventImage = eventMail['eventImages'];
                    eventType = eventMail['type'];
                    eventSeat = eventMail['seats'];
                    eventStart = eventMail['startDate'];
                    eventEnd = eventMail['endDate'];

                    callback(null,1);
                })
            },
            function(callback) {
                userModel.findOne({
                    where: {
                        uniqueId: uniqueAttendee
                    }
                }).then(eventGuest=> {
                    guestName = eventGuest['displayName'];
                    guestEmail = eventGuest['email'];

                    callback(null,1);
                })
            }
        ],
        function() {
            const AWS = require("aws-sdk");

            AWS.config.update({
                accessKeyId: 'AKIAJALUUOBJNRDDDSFA',
                secretAccessKey: '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',
                region: 'us-east-1'
            });

            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            const params = {
            Destination: {
                ToAddresses: [guestEmail] // Email address/addresses that you want to send your email
            },
            Message: {
                Body: {
                    Html: {
                        // HTML Format of the email
                        Charset: "UTF-8",
                        Data: "<html><body style='margin: 0; padding: 0;'><table border='0'><tr style='text-align: center; font-size: 50px;'><td>"+ guestName +"님!</td></tr><tr><td><img src=\"http://public.ongi.tk/image/event_accepted.PNG\"/></td></tr></table></body></html>"
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "Ongi"
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "모임 수락!"
                }
            },
            Source: "no-reply@ongi.tk"
            };

            const sendEmail = ses.sendEmail(params).promise();

            sendEmail
            .then(data => {
                console.log("email submitted to SES", data);
                res.sendStatus(200);
            })
            .catch(error => {
                console.log(error);
            });
        });
    });

    // host가 참가자 decline
    api.post('/me/hosted/:id/declined', sessionChecker(), function(req,res) {
        var eventIndex = req.params.id;
        var uniqueAttendee = req.body.attendeeId;
        var guestName,guestEmail;

        async.series([

            function(callback){
                attendeeModel.update(
                    {attending: 0},
                    {
                    where: {
                        eventId: eventIndex,
                        attendeeId: uniqueAttendee
                    }
                }).then(() => {
                    callback(null,1);
                })
            },
            function(callback) {
                userModel.findOne({
                    where: {
                        uniqueId: uniqueAttendee
                    }
                }).then(eventGuest=> {
                    guestName = eventGuest['displayName'];
                    guestEmail = eventGuest['email'];

                    callback(null,1);
                })
            }
        ],
        function() {
            const AWS = require("aws-sdk");

            AWS.config.update({
                accessKeyId: 'AKIAJALUUOBJNRDDDSFA',
                secretAccessKey: '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',
                region: 'us-east-1'
            });

            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            const params = {
            Destination: {
                ToAddresses: [guestEmail] // Email address/addresses that you want to send your email
            },
            Message: {
                Body: {
                    Html: {
                        // HTML Format of the email
                        Charset: "UTF-8",
                        Data: "<html><body style='margin: 0; padding: 0;'><table border='0'><tr style='text-align: center; font-size: 50px;'><td>"+ guestName +"님!</td></tr><tr><td><img src=\"http://public.ongi.tk/image/event_declined.PNG\"/></td></tr></table></body></html>"
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "Ongi"
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "모임 거절ㅠㅠ"
                }
            },
            Source: "no-reply@ongi.tk"
            };

            const sendEmail = ses.sendEmail(params).promise();

            sendEmail
            .then(data => {
                console.log("email submitted to SES", data);
                res.sendStatus(200);
            })
            .catch(error => {
                console.log(error);
            });
        });
    });


    api.get('/me/attended', sessionChecker(), function(req,res) {   

        var eventIdArr = [];
        var eventIdHoldArr = [];

        var attendTitle = [];
        var attendType = [];
        var attendImage = [];
        var attendSeats = [];
        var attendSDate = [];
        var attendEDate = [];
        var attendHost = [];
        
        var hostName = [];
        var hostImage = [];

        var attendListJson = {};
        var attendListArr = [];

        userId = req.user.uniqueId;

        async.series([
            function(callback) {
                attendeeModel.findAll({
                    where: {
                        attendeeId: userId,
                        attending: 1
                    }
                })
                .then(attendList => {
                    for (var i=0; i<attendList.length; i++){
                        eventIdArr[i] = attendList[i]["eventId"];                        
                    }
                    callback(null,1);
                })
            },
            function(callback) {
                attendeeModel.findAll({
                    where: {
                        attendeeId: userId,
                        attending: 2
                    }
                })
                .then(attendList => {
                    for (var i=0; i<attendList.length; i++){
                        eventIdHoldArr[i] = attendList[i]["eventId"];                        
                    }
                    callback(null,1);
                })
            },
            function(callback) {
                eventModel.findAll({
                    where: {
                        idx: eventIdArr
                    }
                })
                .then(hostList => {
                    for (var i=0; i<eventIdArr.length; i++) {
                        for (var j=0; j<hostList.length; j++) {
                            if (eventIdArr[i] == hostList[j]['idx']) {
                                attendTitle[i] = hostList[j]['title'];
                                attendType[i] = hostList[j]['type'];
                                attendImage[i] = hostList[j]['eventImages'];
                                attendSeats[i] = hostList[j]['seats'];
                                attendSDate[i] = hostList[j]['startDate'];
                                attendEDate[i] = hostList[j]['endDate'];
                                attendHost[i] = hostList[j]['hostId'];
                                break;
                            }
                        }
                    }        
                    callback(null,1);
                })
            },
            function(callback) {
                eventModel.findAll({
                    where: {
                        idx: eventIdHoldArr
                    }
                })
                .then(holdList => {
                    var len = eventIdArr.length;
                    for (var i=0; i<eventIdHoldArr.length; i++) {
                        for (var j=0; j<holdList.length; j++) {
                            if (eventIdHoldArr[i] == holdList[j]['idx']) {
                                attendTitle[i+len] = holdList[j]['title'];
                                attendType[i+len] = holdList[j]['type'];
                                attendImage[i+len] = holdList[j]['eventImages'];
                                attendSeats[i+len] = holdList[j]['seats'];
                                attendSDate[i+len] = holdList[j]['startDate'];
                                attendEDate[i+len] = holdList[j]['endDate'];
                                attendHost[i+len] = holdList[j]['hostId'];
                                break;
                            }
                        }
                    }        
                    callback(null,1);
                })
            },
            function(callback) {
                userModel.findAll({
                    where: {
                        uniqueId: attendHost
                    }
                })
                .then(hostInfo => {
                    
                    for (var i=0; i<attendHost.length; i++) {
                        for (var j=0; j<hostInfo.length; j++) {
                            if (attendHost[i] == hostInfo[j]['uniqueId']) {
                                hostName[i] = hostInfo[j]['displayName'];
                                hostImage[i] = hostInfo[j]['profileImage'];

                                break;
                            }
                        }
                    }        
                    callback(null,1);
                })
            }
        ],
        function() {
            for (var i=0; i<eventIdArr.length + eventIdHoldArr.length; i++) {
                
                if (i < eventIdArr.length) {
                    attendListJson = {
                        "eventIdx": eventIdArr[i],
                        "title": attendTitle[i],
                        "type": attendType[i],
                        "image": attendImage[i],
                        "seats": attendSeats[i],
                        "startDate": attendSDate[i],
                        "endDate": attendEDate[i],
                        "status": true,
                        "hostName": hostName[i],
                        "hostImage": hostImage[i]
                    }        
                } else {
                    attendListJson = {
                        "eventIdx": eventIdHoldArr[i],
                        "title": attendTitle[i],
                        "type": attendType[i],
                        "image": attendImage[i],
                        "seats": attendSeats[i],
                        "startDate": attendSDate[i],
                        "endDate": attendEDate[i],
                        "status": false,
                        "hostName": hostName[i],
                        "hostImage": hostImage[i]
                    }
                }
                attendListArr[i] = attendListJson;
            }
            res.send(attendListArr);
        });
    });

    api.get('/me/venue', sessionChecker(), (req,res) => {   

        var venueListJson = {};
        var venueListArr = [];
        
        venueModel.findAll({
            where: {
                uniqueId: req.user.uniqueId
            }
        })
        .then(venueList => {

            for (var i=0; i<venueList.length; i++){
                venueListJson = {                        
                    "venueId":venueList[i]['idx'],
                    "name": venueList[i]['name'],
                    "address": venueList[i]['state'] +" "+ venueList[i]['city']+" "+ venueList[i]['detail'],
                    "photoUrl":venueList[i]['photoUrl']
                }
                venueListArr[i] = venueListJson;
            }
            res.send(venueListArr);
        })
    });
  
    api.post('/me/update', sessionChecker(), (req, res) => {
        const userModel = users(db.sequelize, db.Sequelize);
        userModel.update({
            uniqueId:req.user.uniqueId,
            displayName:req.body.displayName,
            profileImage:req.body.profileImage,
            gender:req.body.gender,
            country:req.body.country,
            state:req.body.state,
            city:req.body.city
        },
            {
                where: {uniqueId:req.user.uniqueId}
            }).then(() => {
                res.sendStatus(200);
            }).catch(function(err){
                res.send(err);
            });
    });

    return api;
};