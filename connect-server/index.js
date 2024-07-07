import bodyParser from './middlewares/body-parser';
import resJson from './middlewares/res-json';
import router from './routes/index';

/**
 * @param {import('vite').ViteDevServer} server
 */
function serverFactory(server) {
  server.middlewares.use(bodyParser());
  server.middlewares.use(resJson());
  server.middlewares.use('/api', router);
}

export default serverFactory;
