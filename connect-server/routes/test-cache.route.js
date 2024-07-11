import Router from '../middlewares/router';
import FileDbCacheService from '../services/FileDbCacheService';

const router = Router();

const service = FileDbCacheService.getInstance();

// 测试获取文件信息
router.get('/file/:fileId', (req, res, next) => {
  service.resolveFile(req.params.fileId).then((info) => {
    res.json(info);
  }).catch((err) => {
    res.json(err);
  })
})

// 测试读写锁
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



export default router;
