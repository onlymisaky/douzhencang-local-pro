import FileDbCacheService from './FileDbCacheService';

export default class Service extends FileDbCacheService {
  /** @type {Service} */
  static instance = null

  static getInstance() {
    if (!this.instance) {
      this.instance = new Service()
    }
    return this.instance
  }

  constructor() {
    super()
  }

  async _getLikes() {
    const { likes } = await super.readDb('likes')
    return likes
  }

  async _getBookmarks() {
    return await super.readDb('bookmarked')
  }

  _createVideoModel(videoId, videoDescriptions, videos, authors) {
    const desc = videoDescriptions[videoId] || '';
    const { authorId, createTime, diggCount, size } = videos[videoId];
    const { nicknames, followerCount, videoCount, signature, secUid, shortId } = authors[authorId] || {};

    return {
      id: videoId,
      desc,
      diggCount,
      size,
      createTime,
      author: authorId ? {
        id: authorId,
        nicknames,
        followerCount,
        videoCount,
        signature,
        secUid,
        shortId
      } : null
    }
  }

  _createAuthorModel(authorId, authors) {
    const author = {
      id: authorId,
      ...authors[authorId]
    }
    return author
  }

  /**
   * @param {'likes'|'bookmarked'} sourceName 
   * @returns 
   */
  async getVideoList(sourceName, pagination, searchParams = {}) {
    const getList = sourceName === 'likes' ? this._getLikes.bind(this) : this._getBookmarks.bind(this);
    const { disappeared, downloaded, masterList, numDisappeared, total } = await getList()

    const videos = await super.readDb('videos');
    const authors = await super.readDb('authors');
    const videoDescriptions = await super.readDb('videoDescriptions');

    const all = Array.from(new Set(masterList, downloaded, disappeared));
    const { page, size } = { page: 1, size: 20, ...pagination };
    let list = all.slice((page - 1) * size, page * size);

    list = list.map((videoId) => {
      return this._createVideoModel(videoId, videoDescriptions, videos, authors)
    })
    return {
      list,
      page: Number(page),
      size: Number(size),
      total: all.length
    }
  }

  async getVideoDetail(videoId) {
    const videos = await super.readDb('videos');
    if (!videos[videoId]) {
      return null
    }
    const authors = await super.readDb('authors');
    const videoDescriptions = await super.readDb('videoDescriptions');

    return this._createVideoModel(videoId, videoDescriptions, videos, authors)
  }

  async getAuthorList(pagination, searchParams = {}) {
    const authors = await super.readDb('authors');
    const { page, size } = { page: 1, size: 20, ...pagination };
    const list = []
    for (const authorId in authors) {
      list.push(this._createAuthorModel(authorId, authors))
    }
    const total = list.length;

    return {
      list: list.slice((page - 1) * size, page * size),
      page: Number(page),
      size: Number(size),
      total: total
    }
  }

  async getAuthorVideos(authorId, pagination, searchParams = {}) {
    const authors = await super.readDb('authors');
    const author = authors[authorId];
    if (!author) {
      return {
        list: [],
        page: Number(page),
        size: Number(size),
        total: 0
      }
    }
    const videos = await super.readDb('videos');
    const videoDescriptions = await super.readDb('videoDescriptions');
    let list = [];
    for (const videoId in videos) {
      const video = videos[videoId];
      if (video.authorId === authorId) {
        list.push(this._createVideoModel(videoId, videoDescriptions, videos, authors))
      }
    }
    const total = list.length;
    const { page, size } = { page: 1, size: 20, ...pagination };
    return {
      list: list.slice((page - 1) * size, page * size),
      page: Number(page),
      size: Number(size),
      total,
    }
  }
}
