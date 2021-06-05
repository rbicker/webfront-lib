/**
 *  create a debounced function,
 *  which forces a function to wait a certain amount of time before running again
 * @param func the function to debounce
 * @param wait number of miliseconds to wait between runs
 * @returns the debounced function
 */
const debounce = function debounce(func: Function, wait: number) {
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
};

export default debounce;
