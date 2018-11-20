var request = require('supertest');
var Sequelize = require('sequelize');
var api = require('../src').default;
var async = require('async');

const sequelize = new Sequelize('ongi1', 'jicos', 'jicos1234!', {
    host : "jicos.cnxzzmk64bfy.ap-northeast-2.rds.amazonaws.com",
    dialect : "mysql",
})

describe('######API TEST######', ()=>{
    it('루트 디렉토리 GET / ', (done)=>{
        request(api)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
    });
    it('회원가입 가입 가능 POST /join', (done)=>{
        request(api)
            .post('/join')
            .send({userId:'test',
                   accessToken:'test',
                   displayName:'test',
                   gender:'f',
                   profileImage:'',
                   country:'테스트',
                   state:'테스트',
                   city:'테스트'})
            .expect(200)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
            
    });
    it('회원가입 가입 불가능 POST /join', (done)=>{
        request(api)
            .post('/join')
            .send({userId:'test',
                   accessToken:'test',
                   displayName:'test',
                   gender:'f',
                   profileImage:'',
                   country:'테스트',
                   state:'테스트',
                   city:'테스트'})
            .expect(412)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
    });
    it('로그인 비밀번호 틀림 POST /login', (done)=>{
        request(api)
            .post('/login')
            .send({userId:'test',
                   accessToken:'false'})
            .expect(401)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
    });
    it('로그인 아이디 틀림 POST /login', (done)=>{
        request(api)
            .post('/login')
            .send({userId:'login',
                   accessToken:'test'})
            .expect(401)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
    });
    it('로그인 성공 POST /login', (done)=>{
        request(api)
            .post('/login')
            .send({userId:'test',
                   accessToken:'test'})
            .expect(200)
            .end((err) =>{
                if(err) return done(err);
                done();
            });
    });

    after(function(done){
        async.series([
            function(callback){
                sequelize.query(
                    "DELETE FROM `loginCredential` WHERE `provider`='loc' and`userId`='test';"   
                ).then(function (result){
                    callback(null, result);
                }).catch(function (err){
                    callback(err, null);
                })
            },
            function(callback){
                sequelize.query(
                    "DELETE FROM `users` WHERE `displayName`='test';"
                ).then(function (result){
                    callback(null, result);
                }).catch(function (err){
                    callback(err, null);
                })
            }
        ], function(err, result){
            done();
        });
    });

});
