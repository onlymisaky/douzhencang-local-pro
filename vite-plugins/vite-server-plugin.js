import serverFactory from '../connect-server/index';

export default () => {
  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'configure-server',
    configureServer(server) {
      serverFactory(server);
    },
  };
  return plugin;
};
