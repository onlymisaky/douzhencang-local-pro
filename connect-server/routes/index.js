import Router from '../middlewares/router';

const router = Router();

['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
  ['/test', '/test/:id', '/test/:id/:name'].forEach(path => {
    router[method](path, (req, res, next) => {
      const { query, params, method, body } = req;
      res.json({ method, query, params, body });
    })
  })
})

export default router;
