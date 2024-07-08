import fs from 'fs';
import path from 'path';
import { dbCofig, fileConfig } from '../configs/index'

const regex = /window\.db\w*\s*=\s*String\.raw`([^`]*)`;/;

const withResolvers = () => {
  let resolve = void 0;
  let reject = void 0;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return {
    promise,
    resolve,
    reject
  }
}

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
   * @param {{'likes'|'authors'|'bookmarked'|'following'|'videos'|'videoDescriptions'}} dbName
   * @returns 
   */
  readDb(dbName) {
    const { path, } = dbCofig[dbName] || {}
    const isValid = this.exists(path);
    if (isValid instanceof Error) {
      return Promise.reject(isValid);
    }

    let resolve = void 0;
    let reject = void 0;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

    let data = '';
    fs.createReadStream(path, { encoding: 'utf-8' })
      .on('data', (chunk) => { data += chunk; })
      .on('end', () => {
        try {
          resolve(JSON.parse(data.match(regex)[1]));
        } catch (error) {
          reject(error)
        }
      })
      .on('error', (err) => { reject(err); });

    return promise;
  }

  /**
   * @param {{'likes'|'authors'|'bookmarked'|'following'|'videos'|'videoDescriptions'}} dbName
   * @returns 
   */
  writeDb(dbName, data) {
    const { key, path } = dbCofig[dbName];
    const isValid = this.exists(path);
    if (isValid instanceof Error) {
      return Promise.reject(isValid);
    }
    let resolve = void 0;
    let reject = void 0;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

    const str = `window.${key}=String.raw` + `\`${JSON.stringify(data, null, 0)}\``
    fs.writeFile(path, str, { encoding: 'utf-8' }, (err) => {
      if (err) reject(err);
      else resolve();
    })

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
