import logger from './logger';

// point in drawing
interface Point{
  x: number;
  y: number;
  t: number;
  l: boolean;
}

export default class DrawingPad {
  index : number = 1;

  drawing : boolean = false;

  points : Point[] = [];

  canvas : HTMLCanvasElement | undefined;

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) {
      logger.error('canvas is null');
      return;
    }
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      logger.error('could not create 2d context for canvas');
      return;
    }
    // style
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // event handler to start drawing
    const startDrawing = (e : MouseEvent | TouchEvent) => {
      let clientX;
      let clientY;
      if (e.type === 'mousedown') {
        logger.debug('start drawing with mouse');
        clientX = (<MouseEvent>e).clientX;
        clientY = (<MouseEvent>e).clientX;
      } else {
        logger.debug('start drawing with touch');
        // do not scroll while drawing
        e.preventDefault();
        clientX = (<TouchEvent>e).touches[0].clientX;
        clientY = (<TouchEvent>e).touches[0].clientY;
      }
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
      this.points.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        t: new Date().getTime(),
        l: false,
      });
      this.drawing = true;
    };

    // draw
    const draw = (e : MouseEvent | TouchEvent) => {
      let clientX;
      let clientY;
      if (e.type === 'mousedown') {
        logger.debug('start drawing with mouse');
        clientX = (<MouseEvent>e).clientX;
        clientY = (<MouseEvent>e).clientX;
      } else {
        clientX = (<TouchEvent>e).touches[0].clientX;
        clientY = (<TouchEvent>e).touches[0].clientY;
      }
      if (!this.drawing) return;
      // clear canvas before drawing
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const rect = canvas.getBoundingClientRect();
      this.points.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        t: new Date().getTime(),
        l: true,
      });
      for (; this.index < this.points.length; this.index += 1) {
        const i = this.index;
        ctx.beginPath();
        ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
        if (this.points[i].l) {
          // calculate velocity for lineWidth
          const distX = Math.abs(this.points[i].x - this.points[i - 1].x);
          const distY = Math.abs(this.points[i].y - this.points[i - 1].y);
          const distance = Math.sqrt((distX ** 2) + (distY ** 2));
          const velocity = distance / (this.points[i].t - this.points[i - 1].t);
          ctx.lineWidth = 1 / (velocity + 0.4);
          ctx.lineTo(this.points[i].x, this.points[i].y);
          ctx.stroke();
        }
      }
    };

    // event handler to stop drawing
    const stopDrawing = () => {
      logger.debug('stop drawing');
      this.drawing = false;
    };

    // start drawing on mouse down / touch start
    canvas.addEventListener('mousedown', startDrawing, false);
    canvas.addEventListener('touchstart', startDrawing, false);

    // draw on mouse move
    canvas.addEventListener('mousemove', draw, false);
    canvas.addEventListener('touchmove', draw, false);

    // stop drawing on mouse up / mouse leave / touch end / touch cancel
    canvas.addEventListener('mouseup', stopDrawing, false);
    canvas.addEventListener('mouseleave', stopDrawing, false);
    canvas.addEventListener('touchend', stopDrawing, false);
    canvas.addEventListener('touchcancel', stopDrawing, false);
  }

  // clear the canvas and reset the drawing
  clear() {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    if (ctx === null) {
      logger.error('could not create 2d context for canvas');
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.index = 1;
    this.points = [];
  }

  // touched determines if the drawing pad was used
  touched() {
    if (this.index > 1) {
      return true;
    }
    return false;
  }
}
