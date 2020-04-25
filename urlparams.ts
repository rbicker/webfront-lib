// create map<string, string> from url parameters
export default (query : string) => {
  const q = query.replace(/^\?/, '');
  const pairs = q.split('&');
  const results = new Map<string, string>();
  for (let i = 0; i < pairs.length; i += 1) {
    const pair = pairs[i].split('=');
    results.set(pair[0], pair[1]);
  }
  return results;
};
