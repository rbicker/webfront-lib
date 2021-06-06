
# toast
toasts are intended to provide feedback to a user and self-dismiss after a short time with an option to self-dismiss.

./src/lib/components/toast.ts contains a x-toast-container which needs to be included in your app on the default export. It also provides a named export to create a new toast.

```typescript
toast(
  html`<p>Hello</p>`, // contents to display
  'success', // type of toast
  3000, // duration in milliseconds
);
```

the following types are supported out of the box:
* primary (default)
* secondary
* accent
* success
* warning
* error


# example
## ./src/components/app.ts
make sure to include the x-toast-container in your application.

```typescript
/* eslint-disable class-methods-use-this */
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators';
import '../lib/components/toast';
import './toaster';

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

  render() {
    return html`
    <x-toast-container></x-toast-container>
    <x-toaster></x-toaster>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-app': App,
  }
}

```

## ./src/components/toaster.ts
import the `toast` function anywhere in your application and 
call it to display toasts.

```typescript
import { css, html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators';
import { toast } from '../lib/components/toast';
import styles from '../styles/styles';

@customElement('x-toaster')
export default class Toaster extends LitElement {
  static styles = [
    css`
    :host{
      display: block;
    }
    `,
    ...styles,
  ];

  @query('#type')
  inputType!: HTMLInputElement;

  @query('#content')
  inputContent!: HTMLInputElement;

  @query('#duration')
  inputDuration!: HTMLInputElement;

  handleSubmit = (e : Event) => {
    e.preventDefault();
    toast(
      html`<p>${this.inputContent.value}</p>`,
      this.inputType.value,
      +this.inputDuration.value, // + -> type cast string to number
    );
  }

  render() {
    return html`
    <div class="container">
      <div class="row">
        <div class="column">
          <h1>Show toast</h1>
          <fieldset>
            <label for="type">Type</label>
            <select id="type">
              <option value="">Default</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <label for="content">Content</label>
            <textarea id="content">I am a toast...</textarea>
            <label for="duration">Duration</label>
            <input type="number" placeholder="6000" id="duration" value="6000">
            <input class="button button-primary" type="submit" value="toast" @click=${this.handleSubmit}>
          </fieldset>
        </div>
      </div>
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-toaster': Toaster,
  }
}

```