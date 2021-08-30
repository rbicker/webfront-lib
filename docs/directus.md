# directus
directus (https://directus.io) i a headless cms I often use to store content. It has a javascript sdk (https://docs.directus.io/reference/sdk/).

This libary includes a little helper class for multilanguage content.

```typescript
// in ./src/index.ts
// ...
mlDirectus.setDefaultLocale('en');
mlDirectus.setLocale(store.state.language);
window.addEventListener('appstate:language', (e : Event) => {
  const language = (e as CustomEvent).detail.data as string;
  if (store.state.language !== language) {
    mlDirectus.setLocale(language);
  }
});
// ...
```

```typescript
// ./src/components/hello.ts
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import { OneItem } from '@directus/sdk';
import defaultStyles from '../styles/styles';
import { hello, Hello as DirectusHello } from '../directus';
import mlDirectus from '../lib/api/directus';

@customElement('x-hello')
export default class Intro extends LitElement {
  @property({ type: Object })
  content : undefined | OneItem<DirectusHello> = undefined;

  private loadContent = async () => {
    this.content = mlDirectus.mergeTranslations(
      await hello.read(mlDirectus.buildMultiLanguageQuery()),
    );
  };

  private handleStateLanguage = () => {
    this.loadContent();
  };

  connectedCallback() {
    super.connectedCallback();
    this.loadContent();
    window.addEventListener('appstate:language', this.handleStateLanguage);
  }

  disconnectedCallback() {
    window.removeEventListener('appstate:language', this.handleStateLanguage);
    super.disconnectedCallback();
  }

  render() {
    if (!this.content) {
      return html`<div class="container"><div class="loader"></div></div>`;
    }
    return html`
      <div>
        <p>${this.content.hello as string}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-hello': Hello,
  }
}

```