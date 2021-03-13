import logger from './logger';

// match an indicator (? or @), at least one none-whitespace char
// plus an equal sign at the end of the string
const reAttr = /[?,@]\S+\s*=\s*$/;

// random id to use to identify comment-marker
const htmlId = Math.random().toString(36).substring(2, 15)
  + Math.random().toString(36).substring(2, 15);

// EventListener interface to describe the handleEvent function
// and the eventType
interface EventListener {
  handleEvent: (evt : Event) => void;
  options: Record<string, unknown>;
  type: string;
}

// map templateId to
// map of eventListenerSelector to EventListener
const eventListeners = new Map<string, Map<string, EventListener>>();

// html creates an html-template which can then be rendered by using
// the render function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (strings : TemplateStringsArray, ...values : any[]) : string => {
  // identify current template
  const templateId = Math.random().toString(36).substring(2, 15)
  // add a comment with template id
  + Math.random().toString(36).substring(2, 15);
  let out = `<!-- tmpl-${htmlId}-${templateId} -->`;

  // listeners
  const listeners = new Map<string, EventListener>();

  // loop trough strings
  strings.forEach((str, i) => {
    let res = `${str}${values[i] || ''}`;
    const matchesAttr = str.match(reAttr);
    if (matchesAttr) {
      // first character indicates how to handle the value
      const attrMatch = <string>matchesAttr[0];
      // remove question mark at the beginning
      // remove whitespace and equal sign at the end
      const attr = attrMatch.replace(/^[?@]/, '').replace(/s*=\s*$/, '');
      const indicator = attrMatch.charAt(0);
      switch (indicator) {
        case '?': // include attribute if expression evaluates to true
          if (values[i]) { // if expression evaluates to true
            res = str.replace(reAttr, ''); // remove the match
            res += attr; // add attribute (name only)
            break;
          }
          // if expression evaluates to false
          // remove the attribute
          res = str.replace(reAttr, '');
          break;
        case '@': { // add event listener
          res = str.replace(reAttr, ''); // remove attribute, it should never be in the html
          if (!values[i].handleEvent || typeof values[i].handleEvent !== 'function') {
            // https://developer.mozilla.org/de/docs/Web/API/EventListener interface
            logger.error(`the object passed to ${attr} does not provide a function named handleEvent: ${strings.raw}`);
            break;
          }
          // generate event listener id by which the element can be found while rendering
          const listenerId = Math.random().toString(36).substring(2, 15);
          const selector = `data-el-${listenerId}="1"`;
          res = `${res} ${selector}`; // add selector to html
          listeners.set(selector, { ...values[i], type: attr });
          break;
        }
        default:
          // by default,
          // dont alter the res
      }
    }
    out += res;
  });
  if (listeners.size > 0) {
    eventListeners.set(templateId, listeners);
  }
  return out;
};

// render the content as innerHTML of the given element
// also adds event listeners if necessary
const render = function render(element : HTMLElement | null, content :string) : void {
  const elem = element;
  if (elem === null) {
    logger.error(`null element in render function, cannot render content: ${content}`);
    return;
  }
  elem.innerHTML = content;
  // find template markers using html id
  const reComment = new RegExp(`tmpl-${htmlId}-\\S+`, 'g');
  const matches = content.match(reComment);
  if (!matches) {
    logger.error(`html id '${htmlId}' id not found in content: ${content}`);
    return;
  }
  const reHtmlId = new RegExp(`tmpl-${htmlId}-`);
  // we need to loop because multiple template id's can be handled by a single render function
  matches.forEach((match) => {
    const templateId = match.replace(reHtmlId, '').trimRight();
    // get all handlers for given template
    const handlers = eventListeners.get(templateId);
    if (handlers) {
      handlers.forEach((h, selector) => {
        // find element to which handler was bound
        const e = elem.querySelector(`[${selector}]`);
        if (e) {
          // add event listener
          e.addEventListener(h.type, h.handleEvent, h.options);
        } else {
          logger.error(`element not found using selector: ${selector}`);
        }
      });
    }
    eventListeners.delete(templateId);
  });
};

export {
  html,
  render,
};
