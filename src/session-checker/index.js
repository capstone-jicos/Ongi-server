export default (options) => {
  return (req, res, next) => {
    if (typeof req !== 'undefined' && typeof req.user === 'undefined') {
      res.sendStatus(401);
    } else {
      next();
    }
  };
};
