/**
 * urlparams creates a map<string, string> of url parameters from given query string
 * @param query the query string for which to find the parameters
 * @returns map<string, string> containing parameters from given query string
 */
const urlparams = (query : string) => {
  const q = query.replace(/^\?/, '');
  const pairs = q.split('&');
  const results = new Map<string, string>();
  for (let i = 0; i < pairs.length; i += 1) {
    const pair = pairs[i].split('=');
    results.set(pair[0], pair[1]);
  }
  return results;
};

export default urlparams;
