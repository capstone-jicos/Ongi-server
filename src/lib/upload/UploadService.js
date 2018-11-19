var
    formidable = require('formidable'),
    AWS = require('aws-sdk'),
    Upload = {};
AWS.config.region = 'ap-northeast-2'; //지역 서울 설정
var s3 = new AWS.S3();
var form = new formidable.IncomingForm({
    encoding: 'utf-8',
    multiples: true,
    keepExtensions: false //확장자 제거
});
/*S3 버킷 설정*/
var params = {
    Bucket: 'public.ongi.tk',
    Key: null,
    ACL: 'public-read',
    Body: null
};

Upload.formidable = function (req, callback) {
    form.parse(req, function (err, fields, files) {
    });
    form.on('error', function (err) {
        callback(err, null);
    });
    form.on('end', function () {
        callback(null, this.openedFiles);
    });
    form.on('aborted', function () {
        callback('form.on(aborted)', null);
    });
};
Upload.s3 = function (res, req, files, callback) {
    if(!files[0]){
        res.json({success:false, msg:'파일이 존재하지 않음'});
       return callback(1, null);
    }
    else{
        params.Key = 'test/'+files[0].name;
        params.Body = require('fs').createReadStream(files[0].path);
        s3.upload(params, function (err, result) {
            
            req.fileURL = result.Location;
           
            return callback(0,null);
        });
    }
    
};



export default Upload;