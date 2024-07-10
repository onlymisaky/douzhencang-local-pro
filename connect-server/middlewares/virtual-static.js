import fs from 'fs'
import FileDbCacheService from '../services/FileDbCacheService';

const fileDbCacheService = FileDbCacheService.getInstance();

export default (config) => (req, res, next) => {
  const { method, url } = req;
  const { prefix } = { prefix: '/static', ...config };
  if (method.toLowerCase() === 'get' && url.startsWith(prefix) && (url.endsWith('.jpg') || url.endsWith('.mp4'))) {
    const fileName = url.split('/').pop();
    const arr = fileName.split('.')
    const len = arr.length
    if (len < 2) {
      next()
    } else {

      const fileId = arr[arr.length - 2]
      const fileType = {
        mp4: { mimeType: 'video/mp4', type: 'video' },
        jpg: { mimeType: 'image/jpeg', type: 'cover' }
      }[arr[arr.length - 1]]
      fileDbCacheService.resolveFile(fileId).then((info) => {
        let filePath = info.likes[fileType.type] || info.bookmarked[fileType.type];
        if (!filePath) {
          for (const authorId of Object.keys(info.following)) {
            filePath = info.following[authorId][fileType.type];
            if (filePath) {
              break;
            }
          }
        }
        if (!filePath) {
          console.log('资源不存在: ' + fileName);
          next()
        } else {
          fs.stat(filePath, (err, stats) => {
            if (err) {
              next()
              return
            } else {
              if (!stats.isFile()) {
                next()
                return
              }
              res.setHeader('Content-Type', fileType.mimeType);
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
                const readStream = fs.createReadStream(filePath, { start, end });
                readStream.pipe(res);
              } else {
                res.setHeader('Content-Length', stats.size);
                const readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
              }

            }
          })

        }
      }).catch((err) => {
        console.log(err);
        next()
      })
    }
  } else {
    next()
  }
};
