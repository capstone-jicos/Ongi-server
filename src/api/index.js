import { version } from '../../package.json';
import { Router } from 'express';

export default ({config, db, passport}) => {
  let api = Router();

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({version});
  });

  api.post('/login', passport.authenticate('local',
    {successRedirect: '/api', failureFlash: true}
  ));

  return api;
};
