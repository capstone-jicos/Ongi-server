import { version } from '../../package.json';
import { Router } from 'express';
import sessionChecker from '../session-checker';
import event from './event';
import user from './user';
import venue from './venue';
import users from '../models/users';
import credential from '../models/loginCredential';
import timestamp from 'unix-timestamp';
import async from 'async';
import upload from '../lib/upload';
import payments from '../lib/payments';

let uid = 42;

export default ({config, db, passport}) => {
  let api = Router();

  api.post('/upload', [sessionChecker(), upload({config})], (req,res) => {
    console.log(req.photoUrl);
    res.json({photoUrl:req.photoUrl})
  });

  api.post('/payments', (req, res) => {
    let amount = "1000";
    let payload = req.body;
    req.body.amount = amount;
    // TODO UID Rule 설정 필요!!
    // 현재는 Global Variable 로 되어있는데, 이거에 대한 전략 필요!
    req.body.merchant_uid = "merchant_" + (++uid);

    new payments().requestPayment(payload, (result) => {
      res.send({
        "result": JSON.stringify(result)
      })
    });
  });

  api.post('/paycancel', (req, res) => {
    let amount = "";
    let payload = req.body;
    req.body.amount = amount;
    // TODO UID Rule 설정 필요!!
    // 현재는 Global Variable 로 되어있는데, 이거에 대한 전략 필요!
    // req.body.merchant_uid = "merchant_" + (++uid);

    new payments().cancelPayment(payload, (result) => {
      res.send({
        "result": JSON.stringify(result)
      })
    });
  });


  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    let url;
    if (process.env.NODE_ENV === "production") {
      url = "http://www.ongi.tk";
    } else {
      url = "http://localhost:8081";
    }
    res.redirect(url);
  });

  api.get('/logout', function(req, res){
    req.logout();
    res.sendStatus(200);//나중에는 redirect를 해야될듯
  });

  api.post('/login', passport.authenticate('local'), (req, res) => {
    const userModel = users(db.sequelize, db.Sequelize);
    userModel.findOne({where : {uniqueId : req.user.dataValues.uniqueId}}).then(userData =>{
      res.send(userData);
    });
  });

  api.get('/auth', passport.authenticate('google', {scope:['https://www.googleapis.com/auth/plus.login']}));

  api.get('/auth/callback', passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === "production"
      ? "https://www.ongi.tk" : "http://localhost:8081"}),
    function (req, res) {
      let url = process.env.NODE_ENV === "production"
        ? "https://www.ongi.tk" : "http://localhost:8081";
      if (req.user.status === 1) {
        res.redirect(`${url}/my/InfoUpdate`);
      }
      else if (req.user.status === 2) {
        res.redirect(`${url}`);
      }
    }
  );

  api.post('/join', (req, res) => {
    const userModel = users(db.sequelize, db.Sequelize);
    const credentialModel = credential(db.sequelize, db.Sequelize);
    credentialModel.findOne({where : {userId:req.body.userId}}).then(userData => {
      if(userData){ //가입 불가능
        res.sendStatus(412);
      }
      if(!userData){ // 가입 가능
        var id = timestamp.now()*1000;
        async.series([
          function(callback){
            userModel.create({
              uniqueId : id,
              displayName : req.body.displayName,
              profileImage : req.body.profileImage,
              gender : req.body.gender,
              country : req.body.country,
              state : req.body.state,
              city : req.body.city,
              email : req.body.email
            }).then(function (result){
              callback(null, result);
            }).catch(function (err){
              callback(err, null)
            });
          },
          function(callback){
            credentialModel.create({
              provider : 'loc',
              uniqueId : id,
              userId : req.body.userId,
              accessToken : req.body.accessToken
            }).then(function (result){
              callback(null, result);
            }).catch(function (err){
              callback(err, null);
            });
          },
        ], function(err, result){
          if(err) res.send(err)
          else res.send(result)
        });
      }
    });
  });

  api.use('/event', event({ config, db, passport }));
  api.use('/user', user({config, db, passport}));
  api.use('/venue', venue({config, db, passport}));

  return api;
};
