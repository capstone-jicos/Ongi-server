import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import https from 'https';



export default ({config, db}) => {
    let api = Router();

    var async = require('async');

    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);

    var index;

    var venueId;

    var title,description,eventImage,remainingSeat;

    var locationName, locationAddress;
    var coordinates_lat, coordinates_lng;

    var hostId, hostName, hostImage;
    var providerId,providerName,providerImage;


    api.get('/', (req, res) => {

        eventModel.findAll() 
        .then(event => {
            res.json(event);
        });
    });
    
    
    api.get('/:index', function(req,res) {

        async.series([

            // events 테이블 참조
            // index에 해당하는 데이터 가져오기
            // hostId, venueId 담기
            function(callback){
                eventModel.findOne({ 
                    where: {
                        idx: req.params.index
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
    
    return api;
};