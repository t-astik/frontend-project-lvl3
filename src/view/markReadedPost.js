const markReadedPost = ({ uiState: { readedPosts } }, { postsContainer }) => {
  readedPosts.forEach((id) => {
    const postEl = postsContainer.querySelector(`[data-readed="${id}"]`);
    postEl.classList.remove('font-weight-bold');
    postEl.classList.add('font-weight-normal');
  });
};

export default markReadedPost;
