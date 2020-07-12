import logger from './logger';
import { IStore } from './store';

// parameters for the base component's constructor
interface Params{
  props?: any;
  element: HTMLElement;
  renderTriggers?: string[];
  store?: IStore;
}

// base component
export default class Component {
  props: any;

  element: HTMLElement;

  state: any;

  store: IStore|undefined;

  constructor(params: Params) {
    this.props = params.props || {};
    this.element = <HTMLElement>params.element;
    this.state = {};
    this.store = params.store;
    if (params.renderTriggers) {
      if (!this.store) {
        logger.warn(`${params.element?.id} has render triggers defined but the store not set - cannot subscribe`);
        return;
      }
      params.renderTriggers.forEach((trigger) => {
        // use event queue to trigger render to avoid race conditions
        // between javascript and browser rendering
        (<IStore> this.store).subscribe(trigger, () => setTimeout(() => { this.render(); }, 0));
      });
    }
  }

  // change the component's state
  setState = (newState: object) => {
    this.state = { ...this.state, ...newState };
    setTimeout(() => { this.render(); }, 0);
  };

  // render the inner html
  render() {} // eslint-disable-line class-methods-use-this
}
