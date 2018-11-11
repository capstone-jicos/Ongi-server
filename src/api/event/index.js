import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import attendees from '../../models/attendees'
import sessionChecker from '../../session-checker';

export default ({config, db}) => {
    let api = Router();

    var async = require('async');

    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);
    const attendeeModel = attendees(db.sequelize, db.Sequelize);


    var eventIndex;
    var venueId;

    var title,description,eventImage,remainingSeat;

    var locationName, locationAddress;
    var coordinates_lat, coordinates_lng;

    var hostId, hostName, hostImage;
    var providerId,providerName,providerImage;


    // 모임 검색
    // country=? & state=?
    api.get('/', (req, res) => {

        var getCountry = req.query.country;
        var getState = req.query.state;

        var venueIndexArr = [];
        var venueIndexLen;


        async.series([
            function(callback){
                if(getCountry != undefined && getState != undefined) {
                    venueModel.findAll({
                        where: {
                            country: getCountry,
                            state: getState
                        }
                    }) 
                    .then(venueIdx => {
                        venueIndexLen = venueIdx.length;
                        for (var i=0; i<venueIndexLen; i++){
                            venueIndexArr[i] = venueIdx[i]["idx"];
                        }
                        callback(null,1);
                    });    
                } else if(getCountry != undefined && getState == undefined) {
                    venueModel.findAll({
                        where: {
                            country: getCountry
                        }
                    }) 
                    .then(venueIdx => {
                        venueIndexLen = venueIdx.length;
                        for (var i=0; i<venueIndexLen; i++){
                            venueIndexArr[i] = venueIdx[i]["idx"];
                        }
                        callback(null,1);
                    });
                } else {
                    venueModel.findAll() 
                    .then(venueIdx => {
                        venueIndexLen = venueIdx.length;
                        for (var i=0; i<venueIndexLen; i++){
                            venueIndexArr[i] = venueIdx[i]["idx"];
                        }
                        callback(null,1);
                    });
                }
            }
        ],

        function(callback){
            eventModel.findAll({
                where: {
                    venueId: venueIndexArr
                }
            })
            .then(venueList => {
                res.json(venueList);

            });
        }

        );
    });
    
    
    api.get('/:id', function(req,res) {

        eventIndex = req.params.id;
        var usId = req.query.user;
        var attendCheck = false;

        async.series([
            function(callback){

                attendeeModel.findAll({
                    where: {
                        eventId: eventIndex,
                        attendeeId: usId,
                        attending: 1
                    }
                })
                .then(attendChk => {
                    if (attendChk.length > 0) {
                        attendCheck = true;
                    } else{
                        attendCheck = false;
                    }
                    callback(null,1);
                })
            },

            // events 테이블 참조
            // index에 해당하는 데이터 가져오기
            // hostId, venueId 담기
            function(callback){
                eventModel.findOne({ 
                    where: {
                        idx: eventIndex
                    }
                })
                .then(event => {      

                    title = event['title'];
                    description = event['description'];
                    hostId = event['hostId'];
                    venueId = event['venueId'];
                    remainingSeat = event['feeAmount'];
                    eventImage = event['eventImage'];

                    callback(null,1);
                })
            },

            // venue 테이블 참조
            // events 테이블 중 venueId에 해당하는 데이터 가져오기
            // provider_Id 담기
            function(callback){
                venueModel.findOne({
                    where: {
                        idx: venueId
                    }
                })
                .then(venue => {      
                    locationName = venue['detailAddress'];
                    locationAddress = venue['country'] + ' ' + venue['state'] + ' ' + venue['city'] + ' ' + venue['streetAddress'];
                    coordinates_lat = venue['lat'];
                    coordinates_lng = venue['lng'];
                    providerId = venue['uniqueId'];

                    callback(null,1);
                })
            },

            // users 테이블 참조
            // hostId에 해당하는 user 데이터 가져오기
            function(callback){
                userModel.findOne({
                    where: {
                        uniqueId: hostId
                    }
                })
                .then(user => {
                    hostName = user['displayName'];
                    hostImage = user['profileImage'];

                    callback(null,1);
                })
            },

            // users 테이블 참조
            // provider_Id에 해당하는 user 데이터 가져오기
            function(callback){
                userModel.findOne({
                    where: {
                        uniqueId: providerId
                    }
                })
                .then(user2 => {
                    providerName = user2['displayName'];
                    providerImage = user2['profileImage'];

                    callback(null,1);
                })
            }
        ],

        // json파일 생성
        // result 전달
        function(err, results) {
            var val = {
                "attendCheck": attendCheck,
                "title": title,
                "description": description,
                "location": {
                    "name": locationName,
                    "address": locationAddress,
                    "coordinates": {
                        "lat": coordinates_lat,
                        "lng": coordinates_lng
                    }
                },
                "image": eventImage,
                "host": {
                    "id": hostId,
                    "name": hostName,
                    "profileImage": hostImage
                },
                "provider": {
                    "id": providerId,
                    "name": providerName,
                    "profileImage": providerImage
                },
                "remainingSeat": remainingSeat
            };
            
            res.send(val);
        }
        
        );
    });


    // 참석자 목록 받아오기
    api.get('/:id/attendees', (req, res) => {
        var attendeesNum;
        var attendNameArr = [];

        async.series([

            function(callback){
                attendeeModel.findAll({
                    where: {
                        eventId: req.params.id,
                        attending: 1
                    }
                }) 
                .then(attendee => {
                    attendeesNum = attendee.length;
                    for (var i=0; i<attendeesNum; i++){
                        attendNameArr[i] = attendee[i]["attendeeId"];
                    }
                    callback(null,1);
                });
            }],

            function(callback){
                userModel.findAll({
                    where: {
                        uniqueId: attendNameArr
                    }
                })
                .then(userList => {
                    res.json(userList);

                });
            }
        );
    });
  
    // 모임 참가 신청
    // session ID 확인 필요
    api.post('/:id/join', (req, res) => {

        var eventId = req.params.id;
        var sId = req.body.user;
        console.log(sId);

        var attending = 1;

        var haveData_1 = false;
        var haveData_0 = false;
        var NoData = false;

        async.series([

            function(callback){
                attendeeModel.findAll({
                    where: {
                        eventId: eventId,
                        attendeeId: sId,
                    }
                }) 
                .then(attendChk => {
                    if (attendChk.length > 0) {
                        if (attendChk[0]['attending'] == 0) {
                            haveData_1 = false;
                            haveData_0 = true;
                            NoData = false;
                        } else{
                            haveData_1 = true;
                            haveData_0 = false;
                            NoData = false;
                        }
                    } else {
                        haveData_1 = false;
                        haveData_0 = false;
                        NoData = true;
                    }
                    callback(null,1);
                });
            }
        ],

        function(){
            if (NoData) {
                attendeeModel.create({
                    eventId: eventId,
                    attendeeId: sId,
                    attending: attending
                }).then(
                    res.sendStatus(201)
                );
            } 
            else if (haveData_0) {
                attendeeModel.update(
                    {attending: 1},
                    {
                    where: {
                        eventId: eventId,
                        attendeeId: sId
                    }
                }).then(
                    res.sendStatus(201)
                );
            } 
            else {
                res.sendStatus(403)
            }
        });        
            
    });
    
    return api;
};