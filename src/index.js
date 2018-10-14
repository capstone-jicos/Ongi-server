import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import models from './models';
import api from './api';
import config from './config/app.json';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

let app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors({exposedHeaders: config.corsHeaders}));
app.use(session({secret: 'test'}));
app.use(bodyParser.json({limit : config.bodyLimit}));
app.use(bodyParser.urlencoded({limit: config.bodyLimit}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy.Strategy((username, password, done) => {
  // TODO 사용자 로그인 구현하기
  if (username === 'test') {
    if (password === '1234') {
      return done(null, {username:'test'});
    }
  }
  return done(null, false);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// api router
app.use('/api', api({ config, models, passport }));

app.server.listen(process.env.PORT || config.port, () => {
  console.log(`Started on port ${app.server.address().port}`);
});

export default app;
