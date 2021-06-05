# slider

Slider is a small class to help create an element that displays its children in a loop. It comes with a small scss stylesheet. The constructor takes the HTMLElement and optionally the number of milliseconds each slide gets shown. If the mouse hovers over a slide, the slideshow pauses.

## example

```typescript

// ./src/components/slider.ts

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators';
import logger from '../lib/logger';
import LibSlider from '../lib/slider';
import sliderStyle from '../lib/styles/slider.css';

@customElement('x-slider')
export default class Slider extends LitElement {
  static styles = [
    sliderStyle,
    css`
    :host{
      display: block;
      height: 10rem;
    }
    .slider {
      height: 100%;
      margin-bottom: 2rem;
    }
    . slide {
      height: 100%;
    }
    .slide1 {
      background-color: green;
    }
    .slide2 {
      background-color: yellow;
    }
    `,
  ];

  firstUpdated() {
    const elem = this.renderRoot.querySelector('#slider');
    if (elem && elem instanceof HTMLElement) {
      const slider = new LibSlider(elem as HTMLElement);
      slider.run();
    } else {
      logger.debug('x-slider did not find #slider element');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return html`
      <div id="slider">
        <div class="slide1"></div>
        <div class="slide2"></div>
      </div>
    `;
  }
}
```
