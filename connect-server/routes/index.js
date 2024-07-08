import Router from '../middlewares/router';
import FileDbCacheService from '../services/FileDbCacheService';
import LikesService from '../services/LikesService';

const router = Router();

['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
  ['/test', '/test/:id', '/test/:id/:name'].forEach(path => {
    router[method](path, (req, res, next) => {
      const { query, params, method, body } = req;
      res.json({ method, query, params, body });
    })
  })
})

const service = new FileDbCacheService();
const likesService = new LikesService();

router.get('/file/:fileId', (req, res, next) => {
  service.resolveFile(req.params.fileId).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

router.get('/likes', (req, res, next) => {
  likesService.getLikes(req.query).then((list) => {
    res.json(list);
  }).catch((err) => {
    debugger
    res.error(200, err);
  })
})

export default router;
