import virtualStatic from './middlewares/virtual-static';
import bodyParser from './middlewares/body-parser';
import resJson from './middlewares/res-json';
import testRouter from './routes/test.route';
import testCacheRouter from './routes/test-cache.route';
import apiRoute from './routes/index'


/**
 * @param {import('vite').ViteDevServer} server
 */
function serverFactory(server) {
  server.middlewares.use(virtualStatic());
  server.middlewares.use(bodyParser());
  server.middlewares.use(resJson());
  server.middlewares.use('/api', testRouter);
  server.middlewares.use('/api/test-cache', testCacheRouter);
  server.middlewares.use('/api', apiRoute);
}

export default serverFactory;
