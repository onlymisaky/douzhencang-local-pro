export const withResolvers = () => {
  let resolve = void 0;
  let reject = void 0;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return {
    promise,
    resolve,
    reject
  }
}

export const doThenable = (thenAble, resolve, reject) => {
  if (thenAble && typeof thenAble.then === 'function' && typeof thenAble.catch === 'function') {
    return thenAble.then((res) => {
      return doThenable(res, resolve, reject);
    }).catch((err) => {
      return doThenable(err, resolve, reject)
    })
  }
  typeof thenAble instanceof Error ? reject(thenAble) : resolve(thenAble);
}

export const arrayToAsyncIterator = (array) => {
  let index = 0;
  return {
    async next() {
      if (index < array.length) {
        return {
          value: array[index++],
          done: false
        };
      } else {
        return {
          done: true
        };
      }
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
