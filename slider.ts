import logger from './logger';

// slide children of given element
export default class Slider {
  index: number = 0;

  element: HTMLElement;

  slides: HTMLElement[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    const self = this;

    // add slider class
    element.classList.add('slider');

    if (element.children.length === 0) {
      return;
    }

    // loop through all children
    for (let i = 0; i < element.children.length; i += 1) {
      const child = element.children[i];
      if (child instanceof HTMLElement) {
        if (!child.classList.contains('noslide')) {
          this.slides.push(child);
          if (!child.classList.contains('slide')) {
            child.classList.add('slide');
          }
        }
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

  async run(ms = 6000) {
    const timeout = () => new Promise((resolve) => setTimeout(resolve, ms));
    await timeout();
    this.slide();
    this.run();
  }

  // set the slide with the given index active
  setActive(i: number) {
    this.index = i;
    if (i >= this.slides.length || i < 0) {
      logger.error('slider index out of range');
      return;
    }
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

  // switch slides for the given number of times
  // use a negative number to slide in opposite
  // direction.
  slide(n = 1) {
    let i = this.index + n;
    while (i >= this.slides.length) {
      i -= this.slides.length;
    }
    while (i < 0) {
      i += this.slides.length;
    }
    this.setActive(i);
  }
}
