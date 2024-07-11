import fs from 'fs'
import FileDbCacheService from '../services/FileDbCacheService';

const fileDbCacheService = FileDbCacheService.getInstance();

const staticMap = {
  mp4: { mimeType: 'video/mp4', key: 'video' },
  jpg: { mimeType: 'image/jpeg', key: 'cover' }
}

const isStatic = (req, prefix) => {
  const { method, url } = req;
  if (method.toLowerCase() === 'get' && url.startsWith(prefix)) {
    return Object.keys(staticMap).some((ext) => url.endsWith(`.${ext}`))
  }
  return false
}

const getFileNameInfo = (req) => {
  const { url } = req;
  const fileName = url.split('/').pop();
  const arr = fileName.split('.');
  const len = arr.length
  if (len < 2) {
    return null
  }
  return {
    id: arr[arr.length - 2],
    ext: arr[arr.length - 1],
    mimeType: staticMap[arr[arr.length - 1]].mimeType,
  }
}

const getFileInfoFromMap = (map, fileType) => {
  const { likes, bookmarked, following } = map
  if (!likes[fileType].error) {
    return likes[fileType]
  }
  if (!bookmarked[fileType].error) {
    return bookmarked[fileType]
  }
  for (const authorId of Object.keys(following)) {
    if (!following[authorId][fileType].error) {
      return following[authorId][fileType]
    }
  }
  return null
}

const resStatic = (req, res, next, { fullPath, mimeType, stats }) => {
  res.setHeader('Content-Type', mimeType);
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunkSize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
    });
    const readStream = fs.createReadStream(fullPath, { start, end });
    readStream.pipe(res);
  } else {
    res.setHeader('Content-Length', stats.size);
    const readStream = fs.createReadStream(fullPath);
    readStream.pipe(res);
  }
}

export default (config) => (req, res, next) => {
  const { prefix } = { prefix: '/static', ...config };
  if (!isStatic(req, prefix)) {
    next();
    return
  }
  const fileNameInfo = getFileNameInfo(req);
  if (!fileNameInfo) {
    next();
    return
  }
  const { id: fileId, ext, mimeType, } = fileNameInfo;

  fileDbCacheService.resolveFile(fileId).then((fileInfo) => {
    const data = getFileInfoFromMap(fileInfo, staticMap[ext].key);
    if (!data) {
      next()
      console.log('资源不存在: ' + fileId + '.' + ext);
      return
    }
    const { fullPath, ...stats } = data
    resStatic(req, res, next, {
      fullPath,
      mimeType,
      stats,
    })
  })
};
