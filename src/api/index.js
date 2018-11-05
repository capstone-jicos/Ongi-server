import { version } from '../../package.json';
import { Router } from 'express';
import sessionChecker from '../session-checker';
import event from './event';
import users from '../models/users';

export default ({config, db, passport}) => {
  let api = Router();

  // perhaps expose some API metadata at the root
  api.get('/', sessionChecker(), (req, res) => {
    res.json({version});
  });

  api.post('/login', passport.authenticate('local'), (req, res) => {
    const userModel = users(db.sequelize, db.Sequelize);
    userModel.findOne({where : {uniqueId : req.user.dataValues.uniqueId}}).then(userData =>{
      res.send(userData);
    });
  });


  api.use('/event', event({ config, db }));

  return api;
};
  