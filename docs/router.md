# router
Router implements a router to match full paths against (regexp) routes. If a route matches, a callback function is being run which has access to the named regexp groups and the full path. Callback functions can be async. The callback function(s) should run the next() function to proceed with the next handler.

For SEO it is important to use "normal links" in your web application. This is why the router provides a click handler to attach to "document". It acts whenever an internal link / a-Element is being clicked.

# example
```typescript
// routing, for example in ./src/index.ts
const router = new Router();
router.addRoute(/^\/hello\/(?<name>.*)/, async (next, groups) => {
  let name = 'World';
  if (groups && groups.name) {
    name = groups.name;
  }
  // interact with the store
  if (store.state.name !== name) {
    store.set('name', name);
  }
  // do asynchronous stuff
  const timeout = () => new Promise(resolve => setTimeout(resolve, 1000));
  await timeout();
  next();
});

// handle current location's href
router.handleHref(window.location.href);

// add click handler
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', router.getClickHandler());
});

```