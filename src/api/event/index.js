import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import timeTable from '../../models/venueTimeTable';
import attendees from '../../models/attendees'
import sessionChecker from '../../session-checker';
import async from 'async';

export default ({config, db}) => {
    // timestamps: false,
    // freezeTableName: true
    let api = Router();
    
    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);
    const attendeeModel = attendees(db.sequelize, db.Sequelize);

    var eventIndex;
    var venueId;

    var title,description,eventImage,feeAmount,seats,type,startDate,endDate;

    var locationName, locationCountry, locationState, locationCity, locationDetail;
    var coordinates_lat, coordinates_lng;

    var hostId, hostName, hostImage;
    var providerId,providerName,providerImage;

    var sessionId;


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

        var usId;

        if  (req.user == undefined){
            usId = ""
        } else{
            usId = req.user.uniqueId;
        }

        var attendCheck;
        var hostCheck = false;

        async.series([
            function(callback){

                attendeeModel.findAll({
                    where: {
                        eventId: eventIndex,
                        attendeeId: usId,
                    }
                })
                .then(attendChk => {
                    if (attendChk.length > 0) {
                        attendCheck = attendChk[0]['attending'];
                    } else{
                        attendCheck = 0;
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
                    if (event == undefined) {
                        res.send({});
                    } 
                    title = event['title'];
                    description = event['description'];
                    hostId = event['hostId'];
                    venueId = event['venueId'];
                    feeAmount = event['feeAmount'];
                    eventImage = event['eventImages'];
                    type = event['type'];
                    seats = event['seats'];
                    startDate = event['startDate'];
                    endDate = event['endDate'];

                    if (hostId == usId) {
                        hostCheck = true;
                    } else {
                        hostCheck = false;
                    }
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
                    locationName = venue['name'];
                    locationCountry = venue['country'];
                    locationState = venue['state'];
                    locationCity = venue['city'];
                    locationDetail = venue['detail'];
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
                "title": title,
                "description": description,
                "location": {
                    "name": locationName,
                    "country": locationCountry,
                    "state": locationState,
                    "city": locationCity,
                    "detail": locationDetail,
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
                "feeAmount": feeAmount,
                "type": type,
                "seats": seats,
                "startDate": startDate,                
                "endDate": endDate,
                "attendCheck": attendCheck,
                "hostCheck": hostCheck
            };
            
            res.send(val);
            
        }
        
        );
    });


    // 참석자 목록 받아오기
    api.get('/:id/attendees', (req, res) => {
        var attendeesNum;
        var attendNameArr = [];

        var attendListJson = {};
        var attendListArr = [];

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

                    for(var i=0; i<userList.length; i++) {
                        attendListJson = {
                            "uniqueId": userList[i]['uniqueId'],
                            "displayName": userList[i]['displayName'],
                            "profileImage": userList[i]['profileImage']
                        }
                        attendListArr[i] = attendListJson;
                    }
                    
                    res.json(attendListArr);

                });
            }
        );
    });
  
    // 모임 참가 신청
    api.get('/:id/join', sessionChecker(), (req, res) => {

        var eventId = req.params.id;
        var sId = req.user.uniqueId;

        var attending = 2;

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
                    {attending: 2},
                    {
                    where: {
                        eventId: eventId,
                        attendeeId: sId
                    }
                }).then(() => {
                    res.sendStatus(201);
                }).catch(function(err){
                    res.send(err);
                });
            } 
            else {
                res.sendStatus(403)
            }
        });        
            
    });

    api.get('/:id/cancel', sessionChecker(), (req, res) => {

        var eventId = req.params.id;
        var sId = req.user.uniqueId;

        attendeeModel.update(
            {attending: 0},
            {
            where: {
                eventId: eventId,
                attendeeId: sId
            }
        }).then(() => {
            res.sendStatus(201);
        }).catch(function(err){
            res.send(err);
        });
            
    });


    api.post('/create', sessionChecker(), (req, res) => {
        var userId = req.user.uniqueId;
        var eventModel = event(db.sequelize, db.Sequelize);
        async.series([
            function(callback){
                eventModel.create({
                    title: req.body.title,
                    description: req.body.description,
                    hostId: userId,
                    venueId: req.body.venueId,
                    feeAmount: req.body.fee,
                    eventImages: req.body.photoUrl,
                    type: req.body.type,
                    seats: req.body.seats,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate
                }).then(result => {
                    callback(null, result);
                }).catch(function (err){
                    callback(err, null);
                });  
            }            
        ],
            function(err, result){
                if(err) res.send(err)
                else {
                    res.send(result)
                }              
            }
        );
        
    });
    

    // upsert
    api.post('/:id/modify', sessionChecker(), (req, res, err) => {
        var eventId = req.params.id;
        var userId = req.user.uniqueId;

        eventModel.update({
            title: req.body.title,
            description: req.body.description,
            venueId: req.body.venueId,
            feeAmount: req.body.fee,
            eventImages: req.body.photoUrl,
            type: req.body.type,
            seats: req.body.seats,
            date: req.body.date
        }, {
            where: { idx: eventId, hostId: userId }
        })
        .then(() => {
            res.sendStatus(201);
        }).catch(function(err){
            res.send(err);
        });
    });

    return api;
};