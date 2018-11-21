var request = require('supertest');
var Sequelize = require('sequelize');
var session = require('supertest-session');
var api = require('../src').default;
var async = require('async');

const sequelize = new Sequelize('ongi_test', 'jicos', 'jicos1234!', {
    host : "testcode.cnxzzmk64bfy.ap-northeast-2.rds.amazonaws.com",
    dialect : "mysql",
    logging : false
});
var testSession = null;
beforeEach(function (){
    testSession = session(api);
})
describe('####Before authenticating session####', ()=>{

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
        this.timeout(10000);
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
        this.timeout(10000);
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
});

describe('####After authenticating session####', ()=>{
    var authenticatedSession;

    before(function(done) {
        testSession.post('/login')
            .send({userId:'test', accessToken:'test'})
            .expect(200)
            .end(function(err){
                if(err) return done(err);
                authenticatedSession = testSession;
                return done();
            });
    });

    it('my page init GET /user/me', (done) =>{
        this.timeout(10000);
        authenticatedSession.get('/user/me')
            .expect(200)
            .end(function(err, res){
                if(err) return done(err);
                //console.log(res.body);
                done();
            })
    })

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
