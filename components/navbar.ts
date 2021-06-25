/* eslint-disable class-methods-use-this */
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators';
import navbarStyles from '../styles/navbar-css';

@customElement('x-navbar')
export default class NavBar extends LitElement {
  static styles = [navbarStyles];

  render() {
    return html`
    <nav class="bar">
      <slot name="brand" class="bar__brand"></slot>
        <input type="checkbox" id="bar__toggle" name="bar__toggle" class="bar__toggle" />
        <label for="bar__toggle" class="bar__burger">
          <span></span>
          <span></span>
          <span></span>
        </label>
        <slot></slot> <!-- menu items -->
    </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-navbar': NavBar,
  }
}
