import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import timeTable from '../../models/venueTimeTable';
import attendees from '../../models/attendees'
import paymentLog from "../../models/paymentLog";
import accesskey from "../../config/accesskey";
import sessionChecker from '../../session-checker';
import async from 'async';

import payments from "../../lib/payments";

export default ({config, db}) => {
    // timestamps: false,
    // freezeTableName: true
    let api = Router();

    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);
    const attendeeModel = attendees(db.sequelize, db.Sequelize);
    const paymentLogModel = paymentLog(db.sequelize, db.Sequelize);

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

        var getState = req.query.state;
        var getCity = req.query.city;

        var venueIndexArr = [];
        var venueIndexLen;


        async.series([
            function(callback){
                if(getState != undefined && getCity != undefined) {
                    venueModel.findAll({
                        where: {
                            state: getState,
                            city: getCity
                        }
                    })
                    .then(venueIdx => {
                        venueIndexLen = venueIdx.length;
                        for (var i=0; i<venueIndexLen; i++){
                            venueIndexArr[i] = venueIdx[i]["idx"];
                        }
                        callback(null,1);
                    });
                } else if(getState != undefined && getCity == undefined) {
                    venueModel.findAll({
                        where: {
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
    api.post('/:id/join', sessionChecker(), (req, res) => {

        var eventId = req.params.id;
        var sId = req.user.uniqueId;

        var attending = 2;

        var haveData_1 = false;
        var haveData_0 = false;
        var NoData = false;

        var guestName,guestEmail;

      eventModel.findOne({
        attributes: ["feeAmount"],
        where: {
          idx: req.params.id
        }
      }).then(feeAmount => {
        let payload = req.body;
        payload.amount = feeAmount.dataValues.feeAmount;
        paymentLogModel.max("merchant_uid").then(max => {
            let merchant_uid = max + 1;
            payload.merchant_uid = merchant_uid;
            getAttendeeStatus((err, result) => {
                updateAttendeeStatus(merchant_uid, () => {
                    new payments().requestPayment(payload, (result, response) => {
                      if (result) {
                        updateTransactionLog(response, (err, result) => {
                          if (result) {
                            debugger;

                            getUserInfo((err, result) => {
                                var receipt_link = response.receipt_url;
                                sendEmail((receipt_link) => {})
                            })

                            res.status(201).send({
                              "receipt_url": response.receipt_url
                            }).end();
                          }
                        });
                      } else {
                        res.status(403).send({
                          "meesage": payload
                        })
                      }
                    });
                
                })
              }
            );
        });
      });

      function getAttendeeStatus(callback) {
        attendeeModel.findAll({
          where: {
            eventId: eventId,
            attendeeId: sId,
          }
        })
          .then(attendChk => {
            if (attendChk.length > 0) {
              if (attendChk[0]['attending'] === 0) {
                haveData_1 = false;
                haveData_0 = true;
                NoData = false;
              } else {
                haveData_1 = true;
                haveData_0 = false;
                NoData = false;
              }
            } else {
              haveData_1 = false;
              haveData_0 = false;
              NoData = true;
            }
            callback(null, true);
          });
      }     
      
      function getUserInfo(callback) {
          userModel.findOne({
              where: {
                  uniqueId: sId
                }
            }).then(eventGuest=> {
                guestName = eventGuest['displayName'];
                guestEmail = eventGuest['email'];
                callback(null,1);
            })
        }
        
        function sendEmail(callback,receipt) {
                const AWS = require("aws-sdk");
    
                AWS.config.update({
                    accessKeyId: accesskey['accessKeyId'],
                    secretAccessKey: accesskey['secretAccessKey'],
                    region: accesskey['region']
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
                            Data: "<html><body style='margin: 0; padding: 0;'><table border='0'>"
                            +"<tr style='text-align: center; font-size: 50px;'><td>"+ guestName +"님!</td></tr>"
                            +"<tr><td><img src=\"http://public.ongi.tk/image/event_join.PNG\"/></td></tr>"
                            +"<tr style='text-align: center; font-size: 25px;'><td><a href="+receipt+">결제 정보 확인하기</a></td></tr>"
                            +"</table></body></html>"
                        },
                        Text: {
                            Charset: "UTF-8",
                            Data: "Ongi"
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "모임 신청 완료!"
                    }
                },
                Source: "no-reply@ongi.tk"
                };
    
                const sendEmail = ses.sendEmail(params).promise();
    
                sendEmail
                .then(data => {
                    callback(null,1);
                })
            }

      function updateAttendeeStatus(merchant_uid, callback) {
        if (NoData) {
          attendeeModel.create({
            eventId: eventId,
            attendeeId: sId,
            attending: attending,
            merchant_uid: merchant_uid
          }).then(() => {
            callback(null);
          });
        }
        else if (haveData_0) {
          attendeeModel.update(
            {attending: 2,
             merchant_uid: merchant_uid},
            {
              where: {
                eventId: eventId,
                attendeeId: sId
              }
            }).then(() => {
            callback(null);
          }).catch(function (err) {
            res.send(err);
          });
        }
        else {
          res.status(403).send({"message": "이미 등록된 모임입니다."}).end();
        }
      }
      function updateTransactionLog(payload, callback) {
        payload.userId = req.user.uniqueId;
        paymentLogModel.upsert(payload).then(result => {
          callback(null, result);
        });
      }
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

    return api;
};
