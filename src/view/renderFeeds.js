const createFeeds = (feeds) => {
  const feedsList = feeds.map(({ title, description }) => `
  <li class="list-group-item">
    <h3>
      ${title}
    </h3>
    <p>${description}</p>
  </li>
</ul>
  `);
  return `<h2>Фиды</h2><ul class="list-group">${feedsList.join('')}</ul>`;
};

const renderFeeds = ({ feeds }, { feedsContainer }) => {
  const container = feedsContainer;
  container.innerHTML = '';
  container.insertAdjacentHTML('afterbegin', createFeeds(feeds));
};

export default renderFeeds;
