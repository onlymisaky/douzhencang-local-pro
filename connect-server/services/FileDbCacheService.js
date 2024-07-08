import FileDbService from './FileDbService'


class Lock {
  // 不区分读写锁任务函数
  // 读写返回相同的数据
  task = Promise.resolve()
  constructor(type = 'read') {
    this.type = type
  }
}

export default class FileDbCacheService extends FileDbService {
  constructor() {
    super()
    this.dbCache = {}
    this.fileCache = {}
  }

  /**
   * @param {'likes'|'authors'|'bookmarked'|'following'|'videos'|'videoDescriptions'} dbName 
   */
  readDb(dbName) {
    const cache = this.dbCache[dbName]
    if (cache && !(cache instanceof Lock)) {
      return Promise.resolve(cache)
    }

    let lock = new Lock();
    if (!cache) {
      this.dbCache[dbName] = lock
      lock.task = super.readDb(dbName)
    }
    if (cache instanceof Lock) {
      lock = cache
    }
    return lock.task.then((res) => {
      this.dbCache[dbName] = res
      lock = null
      return res
    })
  }

  // TODO 增量更新
  writeDb(dbName, data) {
    const cache = this.dbCache[dbName]

    if (!cache || !(cache instanceof Lock)) {
      let lock = new Lock('write');
      this.dbCache[dbName] = lock
      lock.task = super.writeDb(dbName, data)
      return lock.task.then((str) => {
        this.dbCache[dbName] = data
        lock = null
        return str
      })
    }

    // TODO 待测试
    if (cache.type === 'read') {
      cache.type = 'write'
      cache.task = super.writeDb(dbName, data)
    }
    if (cache.type === 'write') {
      cache.task = cache.task.then((str) => {
        console.log('上一次写完了，开始本次正式写入');
        return super.writeDb(dbName, data)
      })
    }
    return cache.task.then((str) => {
      this.dbCache[dbName] = data
      return str
    })

  }

  resolveFile(fileId) {
    const cache = this.fileCache[fileId]
    if (cache && !(cache instanceof Lock)) {
      return Promise.resolve(cache)
    }

    let lock = new Lock();
    if (!cache) {
      this.fileCache[fileId] = lock
      lock.task = super.resolveFile(fileId)
    }
    if (cache instanceof Lock) {
      lock = cache
    }
    return lock.task.then((res) => {
      this.fileCache[fileId] = res
      lock = null
      return res
    })
  }

  // TODO
  delFile(filePath) {
    const fileId = filePath.split('/').pop().split('.')[0]
    delete this.fileCache[fileId]
    return super.delFile(filePath)
  }
}
