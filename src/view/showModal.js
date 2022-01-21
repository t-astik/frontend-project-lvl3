const showModal = ({ posts, uiState: { showedPostIndex } }, elements) => {
  const { modal } = elements;
  const { title, link, description } = posts[showedPostIndex];
  const modalTitle = modal.querySelector('.modal-title');
  const btn = modal.querySelector('[role="button"]');
  const body = modal.querySelector('.modal-body');
  modalTitle.textContent = title;
  btn.href = link;
  body.textContent = description;
};

export default showModal;
