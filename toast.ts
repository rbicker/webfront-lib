import Component from './component';
import { html, render } from './html';
import logger from './logger';

export default class Toast extends Component {
  constructor() {
    const element = <HTMLElement>document.getElementById('toast');
    super({
      element,
    });
  }

  show(
    text : string,
    timeout : number|undefined,
    classes : string|undefined,
  ) {
    const self = this;
    if (!this.element) {
      logger.error('cannot show toast, no element with id "toast" found');
    }
    this.element.className = `show ${classes}`;
    this.setState({
      text,
      timeout,
      totalTimeout: timeout,
      // classes,
    });
    // nested timeout function
    function f() {
      const t = self.state.timeout === undefined ? 5000 : self.state.timeout;
      if (t > 0) {
        self.setState({ timeout: t - 10 });
        const timeoutFunc = setTimeout(f, 10);

        self.element.onmouseenter = () => {
          // pause timeout on mouse enter
          clearTimeout(timeoutFunc);
          // handler for close button
          (<HTMLElement> self.element.getElementsByClassName('close')[0]).onclick = () => {
            clearTimeout(timeoutFunc);
            self.element.className = ''; // close
          };
        };
        self.setState({ timeoutFunc });
      } else {
        // close when timeout runs out
        self.element.className = '';
      }
    }
    // run timeout function
    f();
    // if timeout was paused on mouse enter,
    // proceed on mouse leave
    this.element.onmouseleave = () => {
      f();
    };
  }

  render() {
    let width = Math.round((this.state.timeout * 100) / this.state.totalTimeout);
    if (width < 1) {
      width = 1;
    }
    const content = html`
    <span class="close">x</span>
    <div class="text">${this.state.text}</div>
    <div class="bar" style="width: ${width}%"></div>
    `;
    render(this.element, content);
  }
}
