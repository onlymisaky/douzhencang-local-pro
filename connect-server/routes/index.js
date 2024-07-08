import Router from '../middlewares/router';
import FileDbService from '../services/FileDbService';

const router = Router();

['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
  ['/test', '/test/:id', '/test/:id/:name'].forEach(path => {
    router[method](path, (req, res, next) => {
      const { query, params, method, body } = req;
      res.json({ method, query, params, body });
    })
  })
})

const fileDbService = new FileDbService();

router.get('/file/:fileId', (req, res, next) => {
  fileDbService.resolveFile(req.params.fileId).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

router.get('/db/:dbName', (req, res, next) => {
  fileDbService.readDb(req.params.dbName).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

export default router;
