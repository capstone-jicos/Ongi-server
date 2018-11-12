import {Router} from 'express';
import sessionChecker from '../../session-checker';
import event from '../../models/events';
import venue from '../../models/venue';
import users from '../../models/users';
import attendees from '../../models/attendees'


export default ({config, db, passport}) => {
    let api = Router();

    api.get('/me', sessionChecker(), (req, res) => {
        const userModel = users(db.sequelize, db.Sequelize);
        userModel.findOne({where : {uniqueId : req.user.dataValues.uniqueId}}).then(userData =>{
        res.send(userData);
        });
    });

    api.post('/me/update', sessionChecker(), (req, res) => {
        const userModel = users(db.sequelize, db.Sequelize);
        userModel.update({uniqueId:req.user.uniqueId, displayName:req.body.displayName},
            {where: {uniqueId: req.user.uniqueId}}).then(() => {
                res.sendStatus(200);
            });

        
    });

    return api;
};