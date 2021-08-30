/**
 * set the given content as the description meta tag.
 * @param content description to set
 */
const setMetaDescription = (content : string) => {
  let field = document.querySelector('meta[name="description"]');
  if (!field) {
    field = document.createElement('meta');
    field.setAttribute('name', 'description');
    document.getElementsByTagName('head')[0].appendChild(field);
  }
  field.setAttribute('content', content);
};

export default setMetaDescription;
