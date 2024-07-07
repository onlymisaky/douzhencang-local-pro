export default () => {
  return (req, res, next) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (error) {
          req.body = body;
        }
      } else {
        req.body = body;
      }
      next();
    });
  };
};
