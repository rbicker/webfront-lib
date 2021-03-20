import logger from './logger';
import { Store } from './store';

// parameters
interface Params{
  store: Store;
}

// Router implements router to match paths against (regexp) routes.
// If a route matches, a callback function is being run which has access
// to the store and the named regexp groups. If the callback function returns
// true, no additional routes will be processed.
export default class Router {
  store: Store;

  routes: {
    re: RegExp,
    cb: (store: Store, groups: {[key: string]: string}|undefined) => boolean
  }[] = [];

  /**
   * constructor
   * @param params Parameters for the router
   */
  constructor(params: Params) {
    this.store = params.store;
  }

  /**
   * add a route (regexp) and a callback function.
   * @param re regular expression to match the route
   * @param cb callback function which is being run when a route matches,
   * returns true to finish routing
   */
  addRoute(re: RegExp, cb: (store: Store, groups: {[key: string]: string}|undefined) => boolean) {
    logger.debug(`added route ${re}`);
    this.routes.push({
      re,
      cb,
    });
  }

  /**
   * first is a callback for routes which takes a list of names and updates the first
   * state (by names) that has a different value than the one given in the route.
   * @param names
   * @returns true
   */
  first(...names : string[]): (store: Store, groups: {[key: string]: string}|undefined) => boolean {
    return (store: Store, groups: {[key: string]: string}|undefined) => {
      if (!groups) {
        logger.error('no named groups in path');
        return true;
      }
      names.some((name) => {
        const value = groups[name];
        // if state is changing
        if (this.store.state[name] !== groups[name]) {
          this.store.set(name, value);
          return true;
        }
        return false;
      });
      return true;
    };
  }

  // todo: path builder that replaces named groups?
  // https://javascript.info/regexp-groups#capturing-groups-in-replacement
  // maybe the current state will be used as starting point, and
  // all the given key(group name)/value(string in url) pairs will be replaced?

  /**
   * handlePath tries to match the given path.
   * If a route matches the path, the route's
   * callback function is being called.
   * @param path the path to handle
   */
  handlePath(path : string) {
    logger.debug(`router is handling path "${path}"`);
    this.routes.some((route) : boolean => {
      const match = path.match(route.re);
      if (match) {
        logger.debug(`path "${path}" matched route ${route.re}`);
        return route.cb(this.store, match.groups);
      }
      return false;
    });
    window.history.pushState({}, (window as any).title || path, path);
  }

  /**
   * getClickHandler return a function which can
   * be used a a click event handler.
   * @returns function which can be used as a click event handler
   */
  getClickHandler(): (event : InputEvent) => void {
    const self = this;
    return (event : InputEvent) => {
      let url = (event.target as HTMLElement).getAttribute('href') || '';
      // do not handle external urls
      if (new URL(url).origin !== window.location.origin) {
        return;
      }
      // stop the browser from navigating to the destination url
      event.preventDefault();
      // remove the leading slash
      if (url.length > 0 && url.charAt(0) === '/') {
        url = url.slice(1);
      }
      self.handlePath(url);
    };
  }
}
