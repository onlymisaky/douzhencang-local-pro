import Router from '../middlewares/router';
import Service from '../services/Service';

const router = Router();
const service = Service.getInstance();

/**
 * 获取 视频列表（点赞 / 收藏）
 */
router.get('/videos/:sourceName', (req, res, next) => {
  const { sourceName } = req.params;
  if (['likes', 'bookmarked'].includes(sourceName)) {
    return service.getVideoList(sourceName, req.query, req.body).then((data) => {
      res.json(data)
    }).catch((err) => {
      res.json({ error: err })
    })
  }
  res.json({ list: [] })
})

/**
 * 获取 视频详情
 */
router.get('/video/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  return service.getVideoDetail(videoId).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.json({ error: err })
  })
})

/**
 * TODO
 * 删除 点赞 / 收藏 
 * data: ['likes', 'bookmarked', 'following'] -- 从数据中删除，意味着下次可能还会重新下载
 * file: 
 */
router.delete('/video/:videoId', (req, res, next) => {
  next()
})


/**
 * TODO
 * 移动文件
 */
router.post('/move/:fileId', (req, res, next) => {
  next()
})

/**
 * TODO
 * 修剪文件，最终只保留一份
 */
router.post('/fix/:fileId', (req, res, next) => {
  next()
})

/**
 * 获取 作者列表（关注的+下载过的）
 */
router.get('/authors', (req, res, next) => {
  service.getAuthorList(req.query, req.body).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.json({ error: err })
  })
})

/**
 * 获取 作者视频 (已下载的)
 */
router.get('/author/:authorId/videos', (req, res, next) => {
  service.getAuthorVideos(req.params.authorId, req.query, req.body).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.json({ error: err })
  })
})

export default router;
