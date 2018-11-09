import { version } from '../../../package.json';
import UploadService from './UploadService';
import {Router} from 'express';
import sessionChecker from '../../session-checker';
import async from 'async';

export default({config, db, passport}) =>{

    return (req, res, next) => {
        var tasks = [
            // function (callback) {
            //     sessionChecker();
            // },
            function (callback) {
                UploadService.formidable(req, function (err, files, field) {
                    callback(err, files);                    
                })
            },
            function (files, callback) {
                UploadService.s3(files, function (err, result) {                   
                    callback(err, files);
                });
            }
        ]

        async.waterfall(tasks, function (err, result) {
            if(!err){
                res.json({success:true, msg:'업로드 성공'})
                next()
                console.log("dd")
            }else{
                res.json({success:false, msg:'실패', err:err})
                next()
            }
        });


    };
   
    

};