function pathToRegex(path) {
  const matchParams = [];
  const cleanPath = path.split('?')[0]; // 去掉路径中的查询参数部分
  const regexPath =
    cleanPath.replace(/:(\w+)/g, (_, param) => {
      matchParams.push(param);
      return '([^/]+)';
    }) + '/?';
  return { matchParams, regex: new RegExp(`^${regexPath}$`) };
}

function matchRoute(routeMap, path) {
  const params = {};
  const query = {};
  let handler;

  const [url, queryString] = path.split('?');

  for (const routePath in routeMap) {
    const { matchParams, regex } = pathToRegex(routePath);
    const match = url.match(regex);
    if (match) {
      const values = match.slice(1);
      matchParams.forEach((param, index) => {
        params[param] = values[index];
      });
      handler = routeMap[routePath];
    }
  }

  if (queryString) {
    const queryParams = queryString.split('&');
    queryParams.forEach((param) => {
      const [key, value] = param.split('=');
      query[key] = value;
    });
  }
  return { params, query, handler };
}

function createRouter() {
  const routePool = {
    get: {},
    post: {},
    delete: {},
    put: {},
    patch: {},
  };

  const router = (req, res, next) => {
    const { method, url } = req;
    const { handler, query, params } = matchRoute(
      routePool[method.toLowerCase()],
      url
    );
    if (handler && typeof handler === 'function') {
      req.params = params;
      req.query = query;
      handler(req, res, next);
    } else {
      next();
    }
  };

  router.get = (path, handler) => {
    routePool.get[path] = handler;
  };

  router.post = (path, handler) => {
    routePool.post[path] = handler;
  };

  router.delete = (path, handler) => {
    routePool.delete[path] = handler;
  }

  router.put = (path, handler) => {
    routePool.put[path] = handler;
  }

  router.patch = (path, handler) => {
    routePool.patch[path] = handler;
  }

  return router;
}

export default createRouter;
