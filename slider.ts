import logger from './logger';

/**
 * Slider to slide children of given element
 */
export default class Slider {
  delay: number;

  start: number = 0;

  remaining: number;

  timerId: number = 0;

  running: boolean = false;

  index: number = 0;

  element: HTMLElement;

  slides: HTMLElement[] = [];

  /**
   * constructor for slider
   * @param element container HTMLElement for the slider
   * @param delay number of milliseconds
   * @returns void
   */
  constructor(element: HTMLElement, delay: number = 6000) {
    this.delay = delay;
    this.remaining = delay;
    this.element = element;
    const self = this;
    if (!element) {
      logger.error('slider element is null');
      return;
    }
    // add slider class
    element.classList.add('slider');

    if (element.children.length === 0) {
      logger.debug('slider has no children');
      return;
    }
    logger.debug(`slider has ${element.children.length} children`);

    // loop through all children
    for (let i = 0; i < element.children.length; i += 1) {
      const child = element.children[i];
      if (child instanceof HTMLElement) {
        if (!child.classList.contains('noslide')) {
          this.slides.push(child);
          if (!child.classList.contains('slide')) {
            child.classList.add('slide');
            child.addEventListener('mouseover', () => {
              logger.debug(`mousover slide ${i}, pausing slider`);
              this.pause();
            });
            child.addEventListener('mouseout', () => {
              logger.debug(`mouseout slide ${i}, running slider`);
              this.run();
            });
          }
        }
      } else {
        logger.debug(`child with index ${i} is not a HTMLElement`);
      }
    }

    // previous button
    const prev = document.createElement('a');
    prev.className = 'prev';
    prev.href = '';
    prev.innerHTML = '&#10094;';
    prev.onclick = ((e) => {
      e.preventDefault();
      self.slide(-1);
    });
    element.append(prev);

    // next button
    const next = document.createElement('a');
    next.className = 'next';
    next.href = '';
    next.innerHTML = '&#10095;';
    next.onclick = ((e) => {
      e.preventDefault();
      self.slide(1);
    });
    element.append(next);

    // dots
    const dots = document.createElement('div');
    dots.className = 'dots';
    for (let i = 0; i < this.slides.length; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.onclick = ((e) => {
        e.preventDefault();
        self.setActive(i);
      });
      dots.append(dot);
    }
    element.append(dots);

    // set first slide active
    this.setActive(0);
  }

  pause() {
    if (this.running) {
      this.running = false;
      logger.debug(`slider clearing timeout ${this.timerId}`);
      window.clearTimeout(this.timerId);
      this.remaining -= new Date().getTime() - this.start;
      logger.debug(`slider pausing, remaining milliseconds: ${this.remaining}`);
    } else {
      logger.debug('slider not pausing as it is already paused');
    }
  }

  run() {
    if (!this.running) {
      logger.debug(`slider is running, remaining milliseconds: ${this.remaining}`);
      this.timerId = window.setTimeout(() => { this.slide(); }, this.remaining);
      this.running = true;
      this.start = new Date().getTime();
    } else {
      logger.debug('slider not starting as it is already running');
    }
  }

  /**
   * set the slide with the given index active
   * @param i index of slide to set active
   * @returns void
   */
  setActive(i: number) {
    if (!this.element) {
      logger.error('slider element is null');
      return;
    }
    this.index = i;
    if (i >= this.slides.length || i < 0) {
      logger.error('slider index out of range');
      return;
    }
    logger.debug(`slider setting active slide to index ${i}`);
    const dots = this.element.getElementsByClassName('dot');
    for (let j = 0; j < this.slides.length; j += 1) {
      const s = this.slides[j];
      const d = dots[j];
      if (i === j) {
        s.classList.add('active');
        d.classList.add('active');
      } else {
        s.classList.remove('active');
        d.classList.remove('active');
      }
    }
  }

  /**
   * switch slides for the given number of times.
   * use a negative number to slide in opposite direction.
   * starts new slider run after sliding.
   * @param n number of slides to move forward / backward
   */
  slide(n = 1) {
    let i = this.index + n;
    while (i >= this.slides.length) {
      i -= this.slides.length;
    }
    while (i < 0) {
      i += this.slides.length;
    }
    this.setActive(i);
    this.running = false;
    window.clearTimeout(this.timerId);
    this.remaining = this.delay;
    this.run();
  }
}
