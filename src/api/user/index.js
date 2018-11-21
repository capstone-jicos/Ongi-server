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

    var userId;

    var eventIndexGlobal = [];

    api.get('/me', sessionChecker(), (req, res) => {
        const userModel = users(db.sequelize, db.Sequelize);
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
                        console.log(hostList[i]['idx']);

                        eventIndex[i] = hostList[i]['idx'];
                        title[i] = hostList[i]['title'];
                        description[i] = hostList[i]['description'];
                        venueId[i] = hostList[i] ['venueId'];
                        feeAmount[i] = hostList[i]['feeAmount'];
                        eventImages[i] = hostList[i]['eventImages'];
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
                    "holdNum": eventIdNum[i]
                }
                hostListArr[i] = hostListJson;
            }
            res.send(hostListArr);
        });

        
    });
    //신청받는사람들 목록
    api.get('/me/hosted/:id', sessionChecker(), function(req,res) {
        var eventIndex = req.user.uniqueId;

        attendeeModel.findAll({
            where: {
                eventId: eventIndex,
                attending: 2
            }
        })
        .then(attendeeList => {
            var attendeeArr = [];
            var attendeeJson = {};
            for (var i=0; i<attendeeList.length; i++) {
                attendeeJson = {
                    "id": attendeeList[i]['attendeeId']
                }
                attendeeArr[i] = attendeeJson;
            }
            res.json(attendeeArr);
        })

        
    });
    
    api.get('/me/attended', sessionChecker(), function(req,res) {   

        var attendListJson = {};
        var attendListArr = [];

        userId = req.user.uniqueId;
        
        attendeeModel.findAll({
            where: {
                attendeeId: userId,
                attending: 1
            }
        })
        .then(attendList => {

            for (var i=0; i<attendList.length; i++){
                attendListJson = {
                    "eventId": attendList[i]["eventId"]
                }
                attendListArr[i] = attendListJson;
            }
            res.send(attendListArr);
        })
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
                    "venue":{
                            "name":venueList[i]['name'],
                            "type": venueList[i]['type'],
                            "amenities": venueList[i]['amenities'],
                            "rules": venueList[i]['rules'],
                            "location": {                            
                                "state":venueList[i]['state'],
                                "city":venueList[i]['city'],
                                "detail":venueList[i]['detail']
                            },
                            "coordinates:":{
                                "lat": venueList[i]['lat'],
                                "lng": venueList[i]['lng']
                            },
                            "people":venueList[i]['accomodate'],
                            "fee":venueList[i]['fee'],
                            "image":venueList[i]['photoUrl']                        
                    }
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