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

router.get('/read-write-test', (req, res, next) => {
  service.readDb('xxx').then((result) => {
    console.log('readDb - 1', result);
    res.json({
      '__mode': 'readDb - 1',
      ...result
    })
  })

  service.readDb('xxx').then((result) => {
    console.log('readDb - 2', result);
  })

  service.writeDb('xxx', { name: Date.now() }).then((result) => {
    console.log('writeDb - name', result);
  })

  service.writeDb('xxx', { age: Date.now() }).then((result) => {
    console.log('writeDb - age', result);
  })

  service.readDb('xxx').then((result) => {
    console.log('readDb - 3', result);
  })

  service.writeDb('xxx', { sex: Date.now() }).then((result) => {
    console.log('writeDb - sex', result);
  })

  service.writeDb('xxx', { xxx: Date.now() }).then((result) => {
    console.log('writeDb - xxx', result);

  })

  service.writeDb('xxx', { yyy: Date.now() }).then((result) => {
    console.log('writeDb - yyy', result);
  })
})

router.get('/likes', (req, res, next) => {
  likesService.getLikes(req.query).then((list) => {
    res.json(list);
  }).catch((err) => {
    res.error(200, err);
  })
})

export default router;
