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

  /**
   * all is a callback for routes which takes a list of names and updates all
   * states (by names) that have different values than the ones given in the route.
   * @param names
   * @returns true
   */
  all(...names : string[]): (store: Store, groups: {[key: string]: string}|undefined) => boolean {
    return (store: Store, groups: {[key: string]: string}|undefined) => {
      if (!groups) {
        logger.error('no named groups in path');
        return true;
      }
      names.forEach((name) => {
        const value = groups[name];
        // if state is changing
        if (this.store.state[name] !== groups[name]) {
          this.store.set(name, value);
        }
      });
      return true;
    };
  }

  /**
   * handlePath tries to match the given path.
   * If a route matches the path, the route's
   * callback function is being called.
   * @param path the path to handle
   */
  handlePath(path : string) {
    const p = path.toLocaleLowerCase();
    logger.debug(`router is handling path "${p}"`);
    this.routes.some((route) : boolean => {
      const match = p.match(route.re);
      if (match) {
        logger.debug(`path "${p}" matched route ${route.re}`);
        return route.cb(this.store, match.groups);
      }
      return false;
    });
    window.history.pushState({}, (window as any).title || path, path);
  }

  /**
   * getClickHandler return a function which can
   * be used as a click event handler for document.
   * @returns function which can be used as a click event handler
   */
  getClickHandler(): (event : MouseEvent) => void {
    const self = this;
    return (event : MouseEvent) => {
      const target = event.target as HTMLElement;
      const elem = target.closest('a');
      if (!elem) {
        // do not handle if not a link
        return;
      }
      if (new URL(elem.href).origin !== window.location.origin) {
        // do not handle external link
        return;
      }
      // stop the browser from navigating to the destination url
      event.preventDefault();
      // handle path
      const href = target.getAttribute('href') || '';
      self.handlePath(href);
    };
  }
}
