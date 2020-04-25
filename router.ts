import { IStore } from './store';
import logger from './logger';

// extract location from hash
const extractLocation = (hash : string) : Array<string> => hash.replace(/^#\/?|\/$/g, '').split('/');

// router
const router = (store : IStore) => {
  const propName = 'location';

  // move path to hash if no hash is in url on page load
  if (window.location.hash === '') {
    window.location.hash = `${window.location.pathname}`;
    window.location.pathname = '';
  }

  // set first location on page load
  store.set(propName, extractLocation(window.location.hash));

  // subscribe to location changes
  // this might be done by the application
  // set url accordingly
  store.subscribe(propName, () => {
    if (typeof store.state[propName] !== 'object') {
      logger.error(`unexpected value in store for key ${propName}, expected array`);
      return;
    }
    const oldPath = extractLocation(window.location.hash).join('/');
    const newPath = store.state[propName].join('/');
    if (oldPath !== newPath) {
      logger.debug(`location hash has been changed programmatically from "${oldPath}" to "${newPath}"`);
      window.location.hash = `/${newPath}`;
    }
  });

  // hash changed callback function
  const handleHashChanged = () => {
    const location = extractLocation(window.location.hash);
    logger.debug(`hashchange window eventlistener was invoked, got location: ${location.join('/')}`);
    store.set(propName, location);
  };

  window.addEventListener('hashchange', handleHashChanged, false);
};

export { router, extractLocation };
