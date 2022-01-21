const itemParse = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;

  // prettier-ignore
  return {
    title, description, link,
  };
};

export default (rss, link) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'application/xml');

  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error(parserError.textContent);
  }

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const items = [...doc.querySelectorAll('item')].map(itemParse);

  // prettier-ignore
  return {
    title, description, link, items,
  };
};
