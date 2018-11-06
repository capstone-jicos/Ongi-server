import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';



export default ({config, db}) => {
    let api = Router();
    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const userModel = users(db.sequelize, db.Sequelize);

    var jsonData = {};
    var location = {};
    var coordinates = {};
    var host = {};
    var provider = {};

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
    
    // events 테이블 참조
    // index에 해당하는 데이터 가져오기
    // hostId, venueId 담기
    api.get('/:index', function(req,res) {d
        eventModel.findOne({ 
            where: {
                idx: req.params.index
            }
        })
        .then(event => {      
            title = event[1];
            description = event[2];
            hostId = event[3];
            venueId = event[4];
            remainingSeat = event[5];
            eventImage = event[6];
        });
    });

    // venue 테이블 참조
    // events 테이블 중 venueId에 해당하는 데이터 가져오기
    // provider_Id 담기
    api.get('/:index', function(req,res) {
        venueModel.findOne({
            where: {
                idx: venueId
            }
        })
        .then(venue => {      
            locationName = venue[5];
            locationAddress = venue[4];
            coordinates_lat = venue[6];
            coordinates_lng = venue[7];
            providerId = venue[8];
        });
    });
    
    // users 테이블 참조
    // hostId에 해당하는 user 데이터 가져오기
    api.get('/:index', function(req,res) {
        userModel.findOne({
            where: {
                uniqueId: hostId
            }
        })
        .then(user => {
            hostName = user[1];
            hostImage = user[2];
        });
    });

    // users 테이블 참조
    // provider_Id에 해당하는 user 데이터 가져오기
    api.get('/:index', function(req,res) {
        userModel.findOne({
            where: {
                uniqueId: providerId
            }
        })
        .then(user2 => {
            providerName = user2[1];
            providerImage = user2[2];
        });
    });

    api.get('/:index', function(req,res) {
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
    
        jsonData = JSON.stringify(val);
        //res.writeHead(200, { "Content-Type": "application/json;characterset=utf-8" });
        //res.write(jsonData);
        //res.end();

        res.render(jsonData);
    });

    return api;
};