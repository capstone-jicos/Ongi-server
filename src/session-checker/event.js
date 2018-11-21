export default (options) => {
    return (req, res, next) => {
      if (typeof req !== 'undefined' && typeof req.user === 'undefined') {
        req.user = "";
        next();
      } else {
        next();
      }
    };
  };
  