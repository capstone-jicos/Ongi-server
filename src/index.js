import http from 'http';
import express from 'express';
import cors from './lib/cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './models';
import api from './api';
import config from './config/app.json';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import credential from './models/loginCredential';
import user from './models/users';
import authKey from "../src/config/auth";
import "babel-polyfill";
import "babel-plugin-transform-runtime";
import timestamp from 'unix-timestamp';

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(session({secret: 'test'}));
app.use(bodyParser.json({limit : config.bodyLimit}));
app.use(bodyParser.urlencoded({limit: config.bodyLimit}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({origins: ["http://localhost:8081", "https://www.ongi.tk"]}));

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.use(new LocalStrategy({
  usernameField:'userId',
  passwordField:'accessToken',
  session: true
},
function(username, password, done){
  const User = user(db.sequelize, db.Sequelize);
  User.findOne({where: {userId: username}}).then(user => {
    if(!user) return done(null, false);
    if(user.dataValues.accessToken != password) return done(null, false);
    return done(null, user);
  })
}));

passport.use(new GoogleStrategy({
  clientID: authKey.clientID,
  clientSecret: authKey.clientSecret,
  callbackURL: "http://localhost:8080/auth/callback"
},
  function(accessToken, refreshToken, profile, done) {
    var id = timestamp.now()*1000;
    const userModel = user(db.sequelize, db.Sequelize);
    const credentialModel = credential(db.sequelize, db.Sequelize);
    credentialModel.findOne({where : {userId:profile.id}}).then((userData) => {
      if(userData){
        userModel.findOne({where: {uniqueId:userData.uniqueId}}).then(userInfo =>{
          userInfo.dataValues.status = 2;
          return done(null, userInfo.dataValues);
        })
      } else {
        userModel.create({
          uniqueId : id,
          displayName : profile.displayName
        }).then(function (result){
          credentialModel.create({
            provider : 'google',
            uniqueId : id,
            userId : profile.id,
            accessToken : profile.id
          }).then(function(result2){
            result.dataValues.status = 1;
            return done(null, result.dataValues);
          }).catch(function(err){
            return done(err);
          })
        }).catch(function (err){
          return done(err);
        });
      }
    })
  }
));
// api router
app.use('/', api({ config, db, passport }));

db.sequelize.sync().then(function () {
  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

export default app;
