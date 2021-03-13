import logger from './logger';
import { Store } from './store';

// parameters for the base component's constructor
interface Params{
  props?: any;
  element: HTMLElement;
  renderTriggers?: string[];
  store?: Store;
}

// base component
export default class Component {
  props: any;

  element: HTMLElement;

  state: any;

  store: Store|undefined;

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
        (<Store> this.store).subscribe(trigger, () => setTimeout(() => { this.render(); }, 0));
      });
    }
  }

  // change the component's state
  setState = (newState: Record<string, unknown>) => {
    this.state = { ...this.state, ...newState };
    setTimeout(() => { this.render(); }, 0);
  };

  // render the inner html
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  render() {} // eslint-disable-line class-methods-use-this
}
