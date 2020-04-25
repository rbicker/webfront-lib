import logger from './logger';

// regex to match id attribute
const reId = /(<|\s)id\s*=\s*("|')\S+("|')/g;

// random id to use to identify comment-marker
const htmlId = Math.random().toString(36).substring(2, 15)
  + Math.random().toString(36).substring(2, 15);

// eventObjects
interface EventObject {
  handleEvent: (evt : Event) => void;
  options: object;
  id: string;
  type: string;
}
const eventObjects = new Map<string, EventObject[]>();

// html template literals function
const html = (strings : TemplateStringsArray, ...values : any[]) : string => {
  // identify current template
  const templateId = Math.random().toString(36).substring(2, 15)
  // add a comment with template id
  + Math.random().toString(36).substring(2, 15);
  let out = `<!-- ${htmlId}-${templateId} -->`;

  // eventobjects
  const evtObjects : EventObject[] = [];

  // loop trough strings
  strings.forEach((str, i) => {
    let res = `${str}${values[i] || ''}`;
    // match an indicator (? or @), at least one none-whitespace char
    // plus an equal sign at the end of the string
    const reAttr = /[?,@]\S+\s*=\s*$/;
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
        case '@': { // event handler
          res = str.replace(reAttr, ''); // remove attribute, it should never be in the html
          if (!values[i].handleEvent || typeof values[i].handleEvent !== 'function') {
            // https://developer.mozilla.org/de/docs/Web/API/EventListener interface
            logger.error(`the object passed to ${attr} does not provide a function named handleEvent: ${strings.raw}`);
            break;
          }
          // regexes
          const reElemStart = /<[^<]*$/g;
          const reElemEnd = />/g;

          let idAttr;
          // search for id before the current position
          for (let j = i; j >= 0; j -= 1) {
            const matchesId = strings[j].match(reId);
            if (matchesId) {
              const found = <string>matchesId[matchesId.length - 1];
              const indexFound = strings[j].indexOf(found);
              // start searching after the index of the match
              const indexElementStart = strings[j].slice(indexFound).search(reElemStart);
              if (indexElementStart > 0) {
                // id was found in an element before the current one
                break;
              }
              idAttr = found;
              break;
            }
            const indexElementStart = strings[j].search(reElemStart);
            // if attribute beginning was reached
            if (indexElementStart > 0) {
              break;
            }
          }

          if (!idAttr) {
            // search for id after the current position
            for (let j = i + 1; j < strings.length - 1; j += 1) {
              const matchesId = strings[j].match(reId);
              const indexElemEnd = strings[j].search(reElemEnd);
              if (matchesId) {
                if (indexElemEnd > 0
                  && strings[j].search(reId) > indexElemEnd) {
                  // id was found in an element after the current one
                  break;
                }
                idAttr = <string>matchesId[0];
                break;
              }
              // if attribute end was reached
              if (indexElemEnd > 0) {
                break;
              }
            }
          }

          let id;
          if (!idAttr) {
            id = Math.random().toString(36).substring(2, 15)
              + Math.random().toString(36).substring(2, 15);
          } else {
            // remove everything before and after the actual id
            id = idAttr.replace(/^(<|\s)id\s*=\s*["']/, '');
            id = id.replace(/["']$/, '');
          }
          // add to event objects
          evtObjects.push({
            handleEvent: values[i].handleEvent,
            type: attr,
            id,
            options: values[i].options,
          });
          // add id
          res += `id="${id}"`;
          break;
        }
        default:
          // by default,
          // dont alter the res
      }
    }
    out += res;
  });
  eventObjects.set(templateId, evtObjects);
  return out;
};

// render the content as innerHTML of the given element
// also adds event listeners if necessary
const render = function render(element : HTMLElement | null, content :string) {
  const elem = element;
  if (elem === null) {
    logger.error(`null element in render function, cannot render content: ${content}`);
    return;
  }
  elem.innerHTML = content;
  // find template id
  const reComment = new RegExp(`${htmlId}-\\S+`);
  const matches = content.match(reComment);
  if (!matches) {
    logger.error(`template id not found in content: ${content}`);
    return;
  }
  const reHtmlId = new RegExp(`${htmlId}-`);
  const templateId = matches[0].replace(reHtmlId, '').trimRight();
  // add event listeners
  const evtObjects = eventObjects.get(templateId);
  if (evtObjects) {
    evtObjects.forEach((eo) => {
      const el = document.getElementById(eo.id);
      if (!el) {
        logger.error(`html element with id ${eo.id} not found, unable to add event listener on ${eo.type}`);
        return;
      }
      el.addEventListener(eo.type, eo);
    });
  }
};

export {
  html,
  render,
};
