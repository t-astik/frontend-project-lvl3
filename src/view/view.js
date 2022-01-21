import onChange from 'on-change';
import markReadedPost from './markReadedPost';
import renderErrors from './renderErrors';
import renderFeeds from './renderFeeds';
import renderPosts from './renderPosts';
import showModal from './showModal';
import processStateHandler from './processStateHandler';

const watch = (state, elements) => onChange(state, (path, value) => {
  const input = document.querySelector('input[name="url"]');
  switch (path) {
    case ('form.valid'):
      if (!value) {
        input.classList.add('is-invalid');
        break;
      }
      input.classList.remove('is-invalid');
      break;
    case ('form.processState'):
      processStateHandler(state, elements);
      break;
    case ('feeds'):
      renderFeeds(state, elements);
      break;
    case ('posts'):
      renderPosts(state, elements);
      break;
    case ('form.errors'):
      renderErrors(state, elements);
      break;
    case ('uiState.readedPosts'):
      markReadedPost(state, elements);
      break;
    case ('uiState.showedPostIndex'):
      showModal(state, elements);
      break;
    default:
      break;
  }
});

export default watch;
