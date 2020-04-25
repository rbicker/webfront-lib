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
        (<IStore> this.store).subscribe(trigger, () => this.render());
      });
    }
  }

  // change the component's state
  setState = (newState: object) => {
    this.state = { ...this.state, ...newState };
    this.render();
  };

  // render the inner html
  render() {} // eslint-disable-line class-methods-use-this
}
