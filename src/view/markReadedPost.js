const markReadedPost = ({ uiState: { readedPosts } }, { postsContainer }) => {
  readedPosts.forEach((id) => {
    const postEl = postsContainer.querySelector(`[data-readed="${id}"]`);
    postEl.classList.remove('fw-bold');
    postEl.classList.add('fw-normal');
  });
};

export default markReadedPost;
