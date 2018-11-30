import {Router} from 'express';
import sessionChecker from '../../session-checker';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import attendees from '../../models/attendees';
import timeTable from '../../models/venueTimeTable';
import applyTable from '../../models/applyVenue';

export default ({config, db, passport}) => {
    let api = Router();
    const Op = db.Sequelize.Op;
    const tableModel = timeTable(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    const applyModel = applyTable(db.sequelize, db.Sequelize);
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

    api.get('/list', (req, res) =>{
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
    })

    api.get('/infor/:id', (req, res) =>{
        var venueId = req.params.id;
        venueModel.findOne({where : {idx : venueId}, include : [{model:tableModel, required : false}]}).then(result =>{
            res.send(result);
        })
    });

    api.get('/apply/:id', sessionChecker(), (req, res) =>{
        var venueId = req.params.id;
        venueModel.findOne({where:{
            idx : venueId
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
                if(errstat) res.sendStatus(412);
                else {
                    applyModel.create({
                        venueId : venueId
                    })
                }
            }
        })
    });

    return api;
};


