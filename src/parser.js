const parse = (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');

  if (dom === null) {
    throw new Error('invalid_rss');
  }
  return dom;
};

export default parse;
