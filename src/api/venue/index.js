import {Router} from 'express';
import sessionChecker from '../../session-checker';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import attendees from '../../models/attendees';
import timeTable from '../../models/venueTimeTable';

export default ({config, db, passport}) => {
    let api = Router();
    const Op = db.Sequelize.Op;
    const tableModel = timeTable(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
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
        
        tableModel.findAll({where : {
            [Op.or]:[{
                startDate:{
                    [Op.lt]:Date(req.params.startDate)
                },
                endDate:{
                    [Op.lt]:Date(req.params.startDate)
                }
            },{
                startDate:{
                    [Op.gt]:Date(req.params.endDate)
                },
                endDate:{
                    [Op.gt]:Date(req.params.endDate)
                }                
            }
            ]            
        }, include : [{model: venueModel, required : true}]})
        .then(result =>{
            res.send(result);
        })
    })

    return api;
};