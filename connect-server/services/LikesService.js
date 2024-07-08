import FileDbCacheService from './FileDbCacheService';

export default class LikesService extends FileDbCacheService {
  constructor() {
    super()
  }

  async getLikes(pagination) {
    const { likes } = await this.readDb('likes')
    const { disappeared, downloaded, masterList, numDisappeared, total } = likes;
    const { page, size } = { page: 1, size: 20, ...pagination };
    const all = Array.from(new Set(masterList, downloaded, disappeared));
    let list = all.slice((page - 1) * size, page * size);
    const videos = await this.readDb('videos');
    const authors = await this.readDb('authors');
    const videoDescriptions = await this.readDb('videoDescriptions');
    list = list.map((videoId) => {
      const desc = videoDescriptions[videoId] || [];
      const { authorId, createTime, diggCount, size } = videos[videoId] || {};
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
    })
    return {
      list,
      page: Number(page),
      size: Number(size),
      total: all.length
    }
  }

}
