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

    var hostListJson = {};
    var hostListArr = [];

    api.get('/:id', function(req,res) {

        userId = req.params.id;

    });

    api.get('/me', sessionChecker(), (req, res) => {
        const userModel = users(db.sequelize, db.Sequelize);
        userModel.findOne({where : {uniqueId : req.user.uniqueId}}).then(userData =>{
        res.send(userData);
        });
    });

    api.get('/me/hosted', function(req,res) {  
               
        userId = req.query.user;

        eventModel.findAll({
            where: {
                hostId: userId
            }
        })
        .then(hostList => {

            for(var i=0; i<hostList.length; i++) {
                hostListJson = {
                    "eventIndex": hostList[i]['idx'],
                    "title": hostList[i]['title'],
                    "description": hostList[i]['description'],
                    "venueId": hostList[i] ['venueId'],
                    "feeAmount": hostList[i]['feeAmount'],
                    "eventImages": hostList[i]['eventImages']
                }
                hostListArr[i] = hostListJson;
            }
            res.send(hostListArr);
        })
    });

    api.get('/me/hosted/:id', function(req,res) {
        var index = req.params.id;
        userId = req.query.user;
        // return res.redirect('http://localhost:8080/event/'+index+'?user='+userId);
        // return res.redirect('../event/'+index+'?user='+userId);
        // 나중에 서버주소로
    });
    
    api.get('/me/attended', function(req,res) {   

        var attendListJson = {};
        var attendListArr = [];

        userId = req.query.user;
        
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

    api.get('/me/venue', function(req,res) {   

        var venueListJson = {};
        var venueListArr = [];

        userId = req.query.user;
        
        venueModel.findAll({
            where: {
                uniqueId: userId
            }
        })
        .then(venueList => {

            for (var i=0; i<venueList.length; i++){
                venueListJson = {
                    "venueIndex": venueList[i]['idx'],
                    "country": venueList[i]['country'],
                    "city": venueList[i]['state'] + " " + venueList[i]['city'],
                    "locationAddress": venueList[i]['streetAddress'],
                    "locationName": venueList[i]['detailAddress'],
                    "coordinates_lat": venueList[i]['lat'],
                    "coordinates_lng": venueList[i]['lng']
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