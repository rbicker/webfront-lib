
// debounce given function with given timer
export default function (func: Function, wait: number) {
  let timeout : number;
  // debounced function
  return function debounced(this: any, ...args : any) {
    const context = this;
    // reset timeout
    const later = function later() {
      timeout = 0;
      func.apply(context, args);
    };
    // restart
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}
