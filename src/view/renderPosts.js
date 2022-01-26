const createPostsList = (posts) => {
  const listItems = posts.map(({
    title,
    link,
    id,
  }) => (`<li class="list-group-item d-flex fw-bold align-items-center justify-content-between">
  <a href="${link}" target="_blank" class="fw-bold"  data-readed="${id}">${title}</a>
  <button data-preview="${id}" role="button" type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal">Просмотр</button></li>`));
  return `<h2>Посты</h2><ul class="list-group">${listItems.join('')}</ul>`;
};

const renderPosts = (state, elements) => {
  const { postsContainer } = elements;
  const { posts } = state;
  postsContainer.innerHTML = '';
  postsContainer.insertAdjacentHTML('beforeend', createPostsList(posts));
};

export default renderPosts;
