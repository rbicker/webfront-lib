import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { repeat } from 'lit/directives/repeat';
import toastStyle from '../styles/toast-css';

/**
 * Toast describes a single toast to display.
 */
type Toast = {
  id : number
  content : TemplateResult
  type : string
  total : number
  remaining : number
}

@customElement('x-toast-container')
export default class ToastContainer extends LitElement {
  // next index while creating a toast
  private index : number = 0;

  // whether timer is running or not
  private running : boolean = false;

  // list of active toasts
  @property({ type: Array })
  private toasts : Array<Toast> = [];

  // wether or not to pause the timer
  private paused : boolean = false;

  private timerId : number = -1;

  static styles = [toastStyle];

  // add event listener for toasts in constructor
  constructor() {
    super();
    window.addEventListener('toast', this.handleNewToast);
  }

  private handleNewToast = (e : Event) => {
    // determine id
    const id = this.index;
    this.index += 1;
    // read toast detail
    const detail = (e as CustomEvent).detail as Toast;
    detail.id = id;
    // add toast
    const t : Toast = {
      id: detail.id,
      content: detail.content,
      type: detail.type,
      remaining: detail.remaining,
      total: detail.total,
    };
    this.toasts = [...this.toasts, t];
    this.run();
  }

  private run() {
    if (this.timerId > 0 || this.paused) {
      return;
    }
    this.timerId = window.setTimeout(() => {
      const toasts = [...this.toasts];
      let index = toasts.length - 1;
      // loop over all toasts in reverse,
      // so it is easier to remove items
      while (index >= 0) {
        if (!this.paused) {
          toasts[index].remaining -= 10;
        }
        if (toasts[index].remaining < -500) {
          // remove expired toast
          toasts.splice(index, 1);
        }
        index -= 1;
      }
      this.toasts = [...toasts];
      // if there are active toasts,
      // keep the timer running
      this.timerId = -1;
      if (this.toasts.length > 0) {
        this.run();
      }
    }, 10);
  }

  private pause = () => {
    this.paused = true;
    if (this.timerId > 0) {
      window.clearTimeout(this.timerId);
      this.timerId = -1;
    }
  }

  private resume = () => {
    this.paused = false;
    this.run();
  }

  private close = (id : number) => {
    const toasts = [...this.toasts];
    let index = toasts.length - 1;
    while (index >= 0) {
      if (toasts[index].id === id) {
        // remove toast
        toasts.splice(index, 1);
        this.toasts = [...toasts];
        return;
      }
      index -= 1;
    }
  }

  render() {
    return html`
      ${repeat(this.toasts, (toast) => toast.id, (toast) => {
    // styling
    let classes = 'toast';
    if (toast.remaining > 0) {
      classes += ' toast--visible';
    }
    if (toast.type !== '') {
      classes += ` toast--type-${toast.type}`;
    }
    // bar width
    let width = Math.round((toast.remaining * 100) / toast.total);
    if (width < 1) {
      width = 1;
    }
    return html`
      <div class="${classes}" @mouseover=${this.pause} @mouseout=${this.resume}>
        <span class="toast__close" @click=${() => { this.close(toast.id); }}>x</span>
        <div class="toast__content">${toast.content}</div>  
        <div class="toast__bar" style="width: ${width}%"></div>
      </div>
      <div></div>
    `;
  })}
  `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-toast-container': ToastContainer,
  }
}

/**
 * create a new toast
 * @param content the content to display within the toast
 * @param ms how many milliseconds the toast should be shown
 * @returns toast id
 */
const toast = (content : TemplateResult, type : string = '', ms : number = 6000) : number => {
  let duration = ms;
  if (ms <= 0) {
    duration = 6000;
  }
  const detail : Toast = {
    id: -1,
    content,
    type,
    total: duration,
    remaining: duration,
  };
  const ev = new CustomEvent('toast', {
    detail,
  });
  window.dispatchEvent(ev);
  return ev.detail.id;
};

export {
  toast,
};
