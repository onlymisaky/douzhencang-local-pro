import fs from 'fs';
import path from 'path';
import { Readable } from 'stream'
import { dbCofig, filePathConfig } from '../configs/index'
import { doThenable, arrayToAsyncIterator, withResolvers } from '../utils/index'

const regex = /window\.db\w*\s*=\s*String\.raw`([^`]*)`(;?)/;

export default class FileDbService {

  /** @type {FileDbService} */
  static instance = null

  static getInstance() {
    if (!this.instance) {
      this.instance = new FileDbService()
    }
    return this.instance
  }

  constructor() { }

  exists(path) {
    if (!path) {
      return new Error('No such database');
    }
    if (!fs.existsSync(path)) {
      return new Error('No such file');
    }

    return true
  }

  /**
   * @param {'likes'|'authors'|'bookmarked'|'following'|'videos'|'videoDescriptions'} dbName 
   */
  readDb(dbName) {
    const { path, } = dbCofig[dbName] || {}
    const isValid = this.exists(path);
    if (isValid instanceof Error) {
      return Promise.reject(isValid);
    }

    const { resolve, reject, promise } = withResolvers()

    let data = '';
    const rs = fs.createReadStream(path, { encoding: 'utf-8' })
      .on('data', (chunk) => {
        data += chunk;
      })
      .on('end', () => {
        try {
          resolve(JSON.parse(data.match(regex)[1]));
        } catch (error) {
          reject(error)
        }
      })
      .on('error', (err) => {
        doThenable(err, resolve, reject);
      });

    promise.cancel = (thenable) => {
      data = null;
      rs.destroy(thenable);
    };
    return promise;
  }

  /**
   * @param {'likes'|'authors'|'bookmarked'|'following'|'videos'|'videoDescriptions'} dbName
   * @param {{Record<string, any> | string}} data
   */
  writeDb(dbName, data) {
    const { key, path } = dbCofig[dbName];
    const isValid = this.exists(path);
    if (isValid instanceof Error) {
      return Promise.reject(isValid);
    }
    const { resolve, reject, promise } = withResolvers()

    let str = '';
    if (typeof data === 'string' && data.startsWith(`window.`)) {
      str = data;
    }
    if (typeof data === 'object' && data !== null) {
      str = `window.${key}=String.raw` + '`' + JSON.stringify(data, null, 0) + '`;';
    }
    if (!str.length) {
      reject(new Error('Invalid data'));
      return promise;
    }

    const rs = Readable.from(arrayToAsyncIterator(str))
    const ws = fs.createWriteStream(path, 'utf-8')
      .on('finish', () => {
        try {
          resolve(JSON.parse(str.match(regex)[1]));
        } catch (error) {
          reject(error)
        }
      })
      .on('error', (err) => {
        doThenable(err, resolve, reject);
      })
    rs.pipe(ws)

    promise.cancel = (thenable) => {
      ws.destroy(thenable);
      rs.destroy();
    }

    return promise;
  }

  /**
   * @param {string} fileId 
   * @param {string} fileSource 
   */
  getFileInfoBySourcePath(fileId, sourcePath) {
    const data = {
      cover: { fullPath: path.resolve(sourcePath, '封面', `${fileId}.jpg`), },
      video: { fullPath: path.resolve(sourcePath, '视频', `${fileId}.mp4`), },
    }
    const { resolve, promise } = withResolvers()
    let count = 0;

    Object.keys(data).forEach((fileType) => {
      const fileInfo = data[fileType];
      const { fullPath } = fileInfo
      fs.stat(fullPath, (err, stats) => {
        count++;
        if (err) fileInfo.error = err;
        else {
          if (!stats.isFile()) {
            fileInfo.error = 'not file';
          } else {
            Object.keys(stats).forEach((key) => {
              if (typeof stats[key] !== 'function') {
                fileInfo[key] = stats[key];
              }
            })
          }
        }
        if (count === 2) {
          resolve(data)
        }
      })
    })

    return promise
  }

  getFileInfoFromFollowing(fileId) {
    const data = {}
    const { resolve, promise } = withResolvers()
    const followingPath = filePathConfig.following
    fs.stat(followingPath, (err, dirStats) => {
      if (err || !dirStats.isDirectory()) {
        resolve(data);
        return;
      }
      fs.readdir(followingPath, (err, authorIds) => {
        if (err || authorIds.length === 0) {
          resolve(data);
          return;
        }
        let len = authorIds.length
        authorIds.forEach((authorId) => {
          this.getFileInfoBySourcePath(fileId, path.resolve(followingPath, authorId))
            .then((fileInfo) => {
              len--;
              if (!fileInfo.video.error && !fileInfo.cover.error) {
                data[authorId] = fileInfo;
                len = 0
              }
              if (len === 0) {
                resolve(data);
              }
            })
        })
      })
    })
    return promise;
  }

  resolveFile(fileId) {
    return Promise.all([
      this.getFileInfoBySourcePath(fileId, filePathConfig.likes),
      this.getFileInfoBySourcePath(fileId, filePathConfig.bookmarked),
      this.getFileInfoFromFollowing(fileId)
    ]).then(([likes, bookmarked, following]) => {
      return {
        likes,
        bookmarked,
        following
      }
    })

  }

  /**
   * @param {string} filePath 
   * @returns 
   */
  delFile(filePath) {
    const isValid = this.exists(filePath);
    if (isValid instanceof Error) {
      return Promise.reject(isValid);
    }

    const { resolve, reject, promise } = withResolvers();

    fs.rm(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    })

    return promise
  }

}
