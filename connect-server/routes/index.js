import Router from '../middlewares/router';
import CacheService from '../services/FileDbCacheService';

const router = Router();

['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
  ['/test', '/test/:id', '/test/:id/:name'].forEach(path => {
    router[method](path, (req, res, next) => {
      const { query, params, method, body } = req;
      res.json({ method, query, params, body });
    })
  })
})

const service = new CacheService();

router.get('/file/:fileId', (req, res, next) => {
  service.resolveFile(req.params.fileId).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

router.get('/db/:dbName', (req, res, next) => {
  service.readDb(req.params.dbName).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

export default router;
