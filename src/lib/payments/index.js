import {Router} from 'express';
const { Iamporter, IamporterError} = require('iamporter');

export default({config}) =>{

    const iamporter = new Iamporter({apiKey: '2310553183193708', secret:'KieoPcd7xp94YwgNUrLf9N7ygHqoDKAn2PMR10Zyq9DoGTbAkXPuLW31EupieZFgPs8Qs7pSg2hWVtwg'});
    return (req, res, next) => {
        iamporter.payOnetime({
            merchant_uid:req.body.uid,
            amount:req.body.amount,
            card_number:req.body.cardNum,
            expiry:req.body.expiry,
            birth:req.body.birth,
            pwd_2digit:req.body.pwd
        }).then(result => {
            console.log(result);
            next();
        }).catch(err => {
            if(err instanceof IamporterError){
                console.log(err);
            }
            next();
        })
    }
}
