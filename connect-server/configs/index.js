import path from 'path'

const root = path.resolve(process.cwd(), '../data')
const dbPath = path.resolve(root, '.appdata')

export const fileConfig = {
  likes: path.resolve(root, '点赞'),
  bookmarked: path.resolve(root, '收藏'),
  following: path.resolve(root, '关注'),
}

export const dbCofig = {
  authors: {
    key: 'dba',
    path: path.resolve(dbPath, 'db_authors.js'),
  },
  bookmarked: {
    key: 'dbb',
    path: path.resolve(dbPath, 'db_bookmarked.js'),

  },
  following: {
    key: 'dbf',
    path: path.resolve(dbPath, 'db_following.js'),
  },
  likes: {
    key: 'db',
    path: path.resolve(dbPath, 'db_likes.js'),
  },
  videoDescriptions: {
    key: 'dbvd',
    path: path.resolve(dbPath, 'db_texts.js'),
  },
  videos: {
    path: path.resolve(dbPath, 'db_videos.js'),
    key: 'dbv',
  },
  xxx: {
    key: 'dbxxx',
    path: path.resolve(dbPath, 'db_xxx.js'),
  },
}
