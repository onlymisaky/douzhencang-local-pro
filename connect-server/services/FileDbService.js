import fs from 'fs';
import path from 'path';
import { Readable } from 'stream'
import { dbCofig, fileConfig } from '../configs/index'
import { doThenable, arrayToAsyncIterator, withResolvers } from '../utils/index'

const regex = /window\.db\w*\s*=\s*String\.raw`([^`]*)`(;?)/;

export default class FileDbService {
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

  resolveFile(fileId) {
    const map = {
      cover: { path: '封面', extension: 'jpg' },
      video: { path: '视频', extension: 'mp4' }
    }

    const data = {
      likes: { cover: '', video: '' },
      bookmarked: { cover: '', video: '' },
    }

    Object.keys(data).forEach((category) => {
      Object.keys(map).forEach((fileType) => {
        const filePath = path.resolve(fileConfig[category], map[fileType].path, `${fileId}.${map[fileType].extension}`);
        if (fs.existsSync(filePath)) {
          data[category][fileType] = filePath;
        }
      })
    })

    const { resolve, promise } = withResolvers()
    const following = {}

    fs.readdir(fileConfig.following, (err, files) => {
      if (err) {
        resolve(data);
        return;
      };
      let fileCount = 0;
      for (const authorId of files) {
        let filePath = path.resolve(fileConfig.following, authorId);
        fs.stat(filePath, (err, stat) => {
          if (err) {
            error
            fileCount++;
          } else {
            if (stat.isDirectory()) {
              const fileTypes = Object.keys(map);
              for (const fileType of fileTypes) {
                const fullPath = path.resolve(filePath, map[fileType].path, `${fileId}.${map[fileType].extension}`);
                if (fs.existsSync(fullPath)) {
                  if (!following[authorId]) {
                    following[authorId] = {}
                  }
                  following[authorId][fileType] = fullPath;
                }
              }
            }
            fileCount++;
          }
          if (fileCount === files.length) {
            resolve({ ...data, following });
          }
        })
      }
    })

    return promise;
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
