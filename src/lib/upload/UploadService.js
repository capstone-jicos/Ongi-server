var
    formidable = require('formidable'),
    AWS = require('aws-sdk'),
    Upload = {};
AWS.config.region = 'ap-northeast-2'; //지역 서울 설정
var s3 = new AWS.S3();

/*S3 버킷 설정*/
var params = {
    Bucket: 'public.ongi.tk',
    Key: null,
    ACL: 'public-read',
    Body: null
};

Upload.formidable = function (req, callback) {
  let form = new formidable.IncomingForm({
    encoding: 'utf-8',
    multiples: true,
    keepExtensions: false
  });

  function onError(err) {
    callback(err, null);
  }

  function onEnd() {
    callback(null, this.openedFiles);
  }

  function onAborted() {
    callback('form.on(aborted)', null);
  }

  form.on('error', onError);
  form.on('end', onEnd);
  form.on('aborted', onAborted);

  form.parse(req, function (err, fields, files) {
  });
};
Upload.s3 = function (res, req, files, callback) {
    if(!files[0]){
        res.status(401);
        res.json({msg:'파일이 존재하지 않음'});
    }
    else{
        console.log(files[0]);
        params.Key = 'image/'+files[0].name;
        params.Body = require('fs').createReadStream(files[0].path);
        s3.upload(params, function (err, result) {
            req.photoUrl = "http://"+result.Bucket+"/"+result.Key;
            res.status(200);
            return callback(0,null);
        });


    }

};



export default Upload;
