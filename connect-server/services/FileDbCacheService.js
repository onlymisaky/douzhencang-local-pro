import FileDbService from './FileDbService'

class Lock {
  // 不区分读写锁任务函数
  // 读写返回相同的数据
  runningTask = Promise.resolve()
}

export default class FileDbCacheService extends FileDbService {

  /** @type {FileDbCacheService} */
  static instance = null

  static getInstance() {
    if (!this.instance) {
      this.instance = new FileDbCacheService()
    }
    return this.instance
  }

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
      lock.runningTask = super.readDb(dbName)
    }
    if (cache instanceof Lock) {
      lock = cache
    }
    return lock.runningTask.then((res) => {
      this.dbCache[dbName] = res
      lock = null
      return res
    })
  }

  // TODO 增量更新
  writeDb(dbName, data) {
    let cache = this.dbCache[dbName]
    if (!cache || !(cache instanceof Lock)) {
      this.dbCache[dbName] = new Lock();
      this.dbCache[dbName].runningTask = super.writeDb(dbName, data)
      cache = this.dbCache[dbName]
    } else if (cache instanceof Lock) {
      let thenable = super.writeDb(dbName, data)
      cache.runningTask.cancel(thenable)
      cache.runningTask = thenable
    }
    return cache.runningTask.then((res) => {
      this.dbCache[dbName] = res
      return res
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
      lock.runningTask = super.resolveFile(fileId)
    }
    if (cache instanceof Lock) {
      lock = cache
    }
    return lock.runningTask.then((res) => {
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
