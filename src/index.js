import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './models';
import api from './api';
import config from './config/app.json';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import UserModel from './models/loginCredential';

let app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({exposedHeaders: config.corsHeaders}));
app.use(session({secret: 'test'}));
app.use(bodyParser.json({limit : config.bodyLimit}));
app.use(bodyParser.urlencoded({limit: config.bodyLimit}));
app.use(passport.initialize());
app.use(passport.session());

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
  const User = UserModel(db.sequelize, db.Sequelize);
  User.findOne({where: {userId: username}}).then(user => {
    if(!user) return done(null, false);
    if(user.dataValues.accessToken != password) return done(null, false);
    return done(null, user);
  })
}));

// api router
app.use('/api', api({ config, db, passport }));

db.sequelize.sync().then(function(){
  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });  
})

export default app;
