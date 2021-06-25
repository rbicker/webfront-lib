# navbar

Navbar provides a mobile-first top navigation bar. It uses flexbox to display its children. Please have a look at the example below to see its intended use.

# example
```typescript
// navigation component ./src/components/navigation.ts

/* eslint-disable class-methods-use-this */
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators';
import '../lib/components/navbar';
import defaultStyles from '../styles/styles';
import navbarStyles from '../lib/styles/navbar-css';

@customElement('x-navigation')
export default class Navigation extends LitElement {
  static styles = [
    css`
    :host{
      display: block;
      border-bottom: .1rem solid #d1d1d1;
      /* overwrite colors (primary and secondary are used by default) */
      --color-navbar-burger: red;
      --color-navbar-x: pink;
    }
    /* invert logo on dark scheme */
    @media (prefers-color-scheme: dark) { 
      #logo {
        -webkit-filter: invert(100%); /* safari 6.0 - 9.0 */
        filter: invert(100%);
      }
    }
    `,
    ...defaultStyles,
    navbarStyles,
  ];

  render() {
    return html`
      <div class="container">
        <x-navbar>
          <div slot="brand">
          <svg id="logo" width="24" height="24" viewBox="0 0 24 24">
            <path d="M18.6,6.62C17.16,6.62 15.8,7.18 14.83,8.15L7.8,14.39C7.16,15.03 6.31,15.38 5.4,15.38C3.53,15.38 2,13.87 2,12C2,10.13 3.53,8.62 5.4,8.62C6.31,8.62 7.16,8.97 7.84,9.65L8.97,10.65L10.5,9.31L9.22,8.2C8.2,7.18 6.84,6.62 5.4,6.62C2.42,6.62 0,9.04 0,12C0,14.96 2.42,17.38 5.4,17.38C6.84,17.38 8.2,16.82 9.17,15.85L16.2,9.61C16.84,8.97 17.69,8.62 18.6,8.62C20.47,8.62 22,10.13 22,12C22,13.87 20.47,15.38 18.6,15.38C17.7,15.38 16.84,15.03 16.16,14.35L15,13.34L13.5,14.68L14.78,15.8C15.8,16.81 17.15,17.37 18.6,17.37C21.58,17.37 24,14.96 24,12C24,9 21.58,6.62 18.6,6.62Z" />
          </svg>
          </div>
          <div>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Work</a></li>
              <li><a href="#">About</a></li>
            </ul>
          </div>
          <div>
          <button class="button button-primary button-outline">
              Subscribe
            </button>
            <button class="button button-accent">
              Lets go!
            </button>
          </div>
        </x-navbar>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-navigation': Navigation,
  }
}

```