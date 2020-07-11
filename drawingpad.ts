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

  canvas : HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      logger.error('could not create 2d context for canvas');
      return;
    }
    // style
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // mouse move event listener
    canvas.addEventListener('mousemove', (e) => {
      if (!this.drawing) return;
      // clear canvas before drawing
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const rect = canvas.getBoundingClientRect();
      this.points.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
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
    });
    // event handler to start drawing
    const startDrawing = (e : MouseEvent) => {
      logger.debug('start drawing');
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      this.points.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t: new Date().getTime(),
        l: false,
      });
      this.drawing = true;
    };
    // event handler to stop drawing
    const stopDrawing = () => {
      logger.debug('stop drawing');
      this.drawing = false;
    };
    // start painting on mouse down
    canvas.addEventListener('mousedown', startDrawing, false);
    // stop painting on mouse up / mouse leave
    canvas.addEventListener('mouseup', stopDrawing, false);
    canvas.addEventListener('mouseleave', stopDrawing, false);
  }

  // clear the canvas and reset the drawing
  clear() {
    const ctx = this.canvas.getContext('2d');
    if (ctx === null) {
      logger.error('could not create 2d context for canvas');
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.index = 1;
    this.points = [];
  }
}
