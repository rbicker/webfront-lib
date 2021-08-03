# state

In modern web development, web applications often use a global state machine to take care of the application's state.
* You should create a TypeScript type that describes your application state.
* You should define the initial state of that type.
* You can then create a new application store using this library based on your initial state.

```typescript
// ./src/store.ts
import ApplicationStore, { Store } from './lib/store';

type AppState = {
  name : string
};

const initialState : AppState = {
  name: 'World',
};

// save initial state, with presistance set to false
export default new ApplicationStore<AppState>(initialState, false);

// method to reset state
const resetStore = (store: Store<AppState>) : void => {
  store.resetState('reset');
};

export {
  AppState,
  resetStore,
};
```

whenever you want to set your store, always use the `store.set('path.to.property', 'value')` method.
```typescript
// ./src/components/xy.ts
import store from '../store';

// ...
store.set('name', name);
// ...
```

The library's application store emits custom events whenever the application state changes.
This enables you to create event listeners for these events.
The events are prefixed by "appstate:" by default.
One common use case is to bind a local property from a LitElement to the application store. This way, the LitElement re-renders whenever the state changes.

```typescript
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import store from '../store';
import './slider';

@customElement('x-app')
export default class App extends LitElement {
  static styles = [
    css`
    :host{
      display: block;
      background-color: var(--color-surface);
      color: var(--color-on-surface);
    }
    `,
  ];

  @property({ type: String })
  name = store.state.name as String;

  private handleStateName = (e : Event) => {
    // `this` refers to the component
    // because we use an arrow function
    this.name = (e as CustomEvent).detail.data as String;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('appstate:name', this.handleStateName);
  }

  disconnectedCallback() {
    window.removeEventListener('appstate:name', this.handleStateName);
    super.disconnectedCallback();
  }

  render() {
    return html`
    <div class="container">
      <div class="row">
        <div class="column">
          <h1>Hello ${this.name.charAt(0).toUpperCase() + this.name.slice(1)}!</h1>
        </div>
      </div>
    </div>`;
  }
}
```

(just a reminder for myself: if the state property holds a list, it mostly makes sense to use lit's `repeat(items, keyFunction, itemTemplate)`function)