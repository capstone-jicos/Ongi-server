import { version } from '../../package.json';
import { Router } from 'express';
import sessionChecker from '../session-checker';

export default ({config, db, passport}) => {
  let api = Router();

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    console.log(req.query.key)
    res.json({version});
  });

  api.post('/login', passport.authenticate('local'), (req, res) => {
    res.sendStatus(200);
  });

  return api;
};
  