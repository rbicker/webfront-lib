import logger from './logger';

/**
 * Router implements a router to match full paths (href without origin)
 * against (regexp) routes.
 * If a route matches, a callback function is being run which has access
 * to the named regexp groups and the full path.
 * The callback function(s) should run the next() function
 * to proceed with the next handler.
 */
export default class Router {
  routes: {
    re: RegExp,
    cb: (
      next: () => void,
      groups: {[key: string]: string},
      fullPath : string
    ) => void | Promise<void>
  }[] = [];

  defaultRoute: ((fullPath : string) => void) | undefined = undefined

  /**
   * add a route (regexp) and a callback function.
   * @param re regular expression to match the route
   * @param cb callback function which is being run when a route matches,
   * returns true to finish routing
   */
  addRoute(re: RegExp,
    cb: (
      next: () => void,
      groups: {[key: string]: string},
      fullPath : string,
      ) => void) {
    logger.debug(`added route ${re}`);
    this.routes.push({
      re,
      cb,
    });
  }

  /**
   * handleHref tries to match the given location href.
   * If routes match the href, the
   * callback functions are being called.
   * @param href the href to handle
   */
  handleHref(href : string) {
    const replace = `^${window.location.origin}`;
    const path = href.replace(new RegExp(replace), '').toLowerCase();
    logger.debug(`router is handling path "${path}"`);

    const matches : {
      cb: (next: () => void, groups: {[key: string]: string}, fullPath : string) => void
      groups: {[key: string]: string},
      fullPath : string
    }[] = [];

    this.routes.forEach((route) => {
      const match = path.match(route.re);
      if (match) {
        logger.debug(`path "${path}" matched route ${route.re}`);
        const groups = match.groups || {};
        matches.push({ cb: route.cb, groups, fullPath: path });
      }
    });
    if (matches.length > 0) {
      this.runCallback(matches, 0);
    } else if (this.defaultRoute) {
      logger.debug(`running default route for path "${path}"`);
      this.defaultRoute(path);
    }
    window.history.pushState({}, (window as any).title || path, path);
  }

  /**
   * runCallback runs the callback function from the given array at the given index.
   * the function is responsible to create a next function which points to the next callback.
   * @param matches array of matched routes, containing callback functions and regex groups
   * @param index the index to the element in the matches array for which to run the callback
   * @returns void
   */
  private runCallback(matches : {
    cb: (next: () => void, groups: {[key: string]: string}, fullPath : string) => void,
    groups: {[key: string]: string},
    fullPath: string,
  }[], index : number) {
    if (index >= matches.length) {
      return;
    }
    const next = () => {
      this.runCallback(matches, index + 1);
    };
    matches[index].cb(next, matches[index].groups, matches[index].fullPath);
  }

  /**
   * getClickHandler return a function which can
   * be used as a click event handler for document.
   * @returns function which can be used as a click event handler
   */
  getClickHandler(): (event : MouseEvent) => void {
    const self = this;
    return (event : MouseEvent) => {
      const elem = event.composedPath()[0] as Element;
      if (!elem) {
        // do not handle if not a link
        return;
      }
      // only handle internal paths
      const href = elem.getAttribute('href');
      if (!href || href.length === 0 || href.charAt(0) !== '/') {
        return;
      }
      // stop the browser from navigating to the destination url
      event.preventDefault();
      // handle path
      logger.debug('router is handling click event');
      self.handleHref(href);
    };
  }
}
