export default () => (req, res, next) => {
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  };
  res.error = (code, message) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = code;
    res.end(JSON.stringify({ code, message }));
  }
  next();
};
