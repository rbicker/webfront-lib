import logger from './logger';

interface IStore{
  set: (propertyString: string, value: any)=>void;
  publish: (event : string, data: any)=>void;
  subscribe: (event:string, callback:Function)=>void;
  readonly state: { [key: string]: any };
}

class Store {
  events: { [key: string]: Function[] };

  state: { [key: string]: any };

  persist: boolean;

  constructor(initialState: object | undefined, persist? : boolean) {
    this.events = {};
    this.state = initialState || {};
    this.persist = persist || false;
    if (persist && localStorage.getItem('state')) { // load state from localstorage
      // overwrite initial state with the one loaded from localstorage
      this.state = { ...initialState, ...JSON.parse(<string>localStorage.getItem('state')) };
    }
    // listen for window messages with id
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (data.id) {
        logger.debug(`received window message with an id - adding to state as windowmessage_${data.id}`);
        this.set(`windowmessage_${data.id}`, event.data);
      }
    }, false);
  }

  /**
     * setState works like a simplified version of lodash's _.set(),
     * only it sets this.state instead of an arbitrary object.
     *
     * usage example:   setState('city.street[0].color', 'brown');
     */
  set(propertyString: string, value: any) : void{
    logger.debug(`setting state "${propertyString}": ${JSON.stringify(value)}`);

    // this Regex was borrowed from https://github.com/lodash/lodash/blob/4.17.15-es/_stringToPath.js
    const propertyNameMatcher : RegExp = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    const propertyArray : (string | number)[] = [];

    // split our propertyString into an array of values
    propertyString.replace(propertyNameMatcher, (match : string, number : number) => {
      propertyArray.push(number || match);
      return match;
    });

    // use the propertyArray to traverse our state object and set the value
    propertyArray.reduce(
      (accumulator : { [key: string] : any },
        currentVal : string | number, index : number, array : (string | number)[]) => {
        if (index + 1 === array.length) {
          accumulator[currentVal] = value; // set our property!
          return true;
        }

        return accumulator && accumulator[currentVal] ? accumulator[currentVal] : null;
      }, this.state,
    );
    if (this.persist) {
      localStorage.setItem('state', JSON.stringify(this.state)); // save state to local storage
    }
    this.publish('state', this.state); // announce that 'state' was updated
    this.publish(propertyString, value); // announce the specific property that was updated
  }

  // announce change of data
  publish(event : string, data = {}) {
    if (!Object.prototype.hasOwnProperty.call(this.events, event)) {
      return [];
    }
    return this.events[event].map((callback : Function) => callback(data));
  }

  // subscribe to changing data
  subscribe(event : string, callback : Function) {
    if (!Object.prototype.hasOwnProperty.call(this.events, event)) {
      this.events[event] = [];
    }
    return this.events[event].push(callback);
  }
}

export {
  Store,
  IStore,
};
