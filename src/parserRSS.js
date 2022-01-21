// import _ from 'lodash';

const parseItems = (xmlDoc) => Array.from(xmlDoc.querySelectorAll('item'))
  .reduce((acc, item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const date = item.querySelector('pubDate').textContent;
    return [
      ...acc,
      {
        title,
        description,
        link,
        date,
      },
    ];
  }, []);

const checkRss = (doc) => doc.children[0].tagName === 'rss';

export default function parserRSS(string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'application/xml');
  if (!checkRss(doc)) {
    throw new Error('invalid-rss');
  }
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const posts = parseItems(doc);
  return {
    feed: { title, description },
    posts,
  };
}
