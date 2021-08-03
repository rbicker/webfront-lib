import logger from './logger';

// Store describes an interace that can be used to save a state.
interface Store<StateType>{
  set: (propertyString: string, value: any)=>void;
  resetState:(event : string) => void;
  readonly state: StateType;
}

// ApplicationStore is the implementation of store to save  an application state.
export default class ApplicationStore<StateType> implements Store<StateType> {
  events: { [key: string]: ((data: any) => void)[] };

  initialState: StateType;

  state: StateType;

  name : string;

  context: typeof globalThis;

  persist: boolean;

  /**
   * create a new store.
   * @param initialState the initial state of the store
   * @param persist persist store to local storage
   */
  constructor(initialState: StateType, persist? : boolean) {
    this.events = {};
    this.initialState = initialState;
    this.state = initialState;
    this.name = 'appstate';
    this.context = window;
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
     * usage example:   setState('city.street[0].color', 'brown');s
     *
     * @param propertyString the path to the property
     * @param value the value to set the property to
     */
  set(propertyString: string, value: any) : void {
    logger.debug(`setting state "${propertyString}": ${JSON.stringify(value)}`);

    // this Regex was borrowed from https://github.com/lodash/lodash/blob/4.17.15-es/_stringToPath.js
    const propertyNameMatcher = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
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
    if (propertyString !== 'state') {
      this.publish('state', this.state); // announce that 'state' was updated
    }
    this.publish(propertyString, value); // announce the specific property that was updated
  }

  /**
   * publish fires a custom event named this.name:event (so appstate:userid for example)
   * to which components can subscribe by creating event listeners.
   *
   * @param event name of the event
   * @param data data to publish
   */
  publish(event : string, data = {}) : void {
    const name = `${this.name}:${event}`;
    this.context.dispatchEvent(
      new CustomEvent(name, {
        detail: { event, data },
      }),
    );
    logger.debug(`store fired custom event "${name}"`);
  }

  /**
   * reset the application state to it's initial state.
   * Be careful, only one event (named 'reset' by default) will be published, if you use this method
   * be sure to subscribe to state on a high level to reload your whole app.
   */
  resetState(event = 'reset') : void {
    this.state = this.initialState;
    if (this.persist) {
      localStorage.removeItem('state');
    }
    this.publish(event, this.state);
  }
}

export {
  Store,
};
