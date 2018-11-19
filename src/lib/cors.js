export default (options) => {
  let optionsCallback = (req, res, callback) => {
    callback(null, options);
  };

  return (req, res, next) => {
    optionsCallback(req, res, (err, options) => {
      let origin;
      let origins = options.origins;

      console.log(options);
      for (let i = 0; i < origins.length; i++) {
        if (req.headers.origin === origins[i]) {
          origin = origins[i];
        }
      }

      res.set("Access-Control-Allow-Origin", origin || "*");
      res.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
      res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.set("Access-Control-Allow-Credentials", true);
      next();
    });
  };
};
