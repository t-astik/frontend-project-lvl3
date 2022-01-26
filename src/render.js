/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import { target } from 'on-change';

import {
  FILLING,
  SUBMITTED,
  SUBMITTING,
  FAILED,
  SUCCESS,
  ERROR,
} from './constants.js';

const buildFeedList = (feeds) => {
  const buildFeedListItem = (feed) => {
    const li = document.createElement('li');
    const h2 = document.createElement('h3');
    const p = document.createElement('p');

    li.classList.add('list-group-item');
    li.append(h2, p);
    h2.textContent = feed.title;
    p.textContent = feed.description;

    return li;
  };

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  feeds.forEach((feed) => {
    const feedEl = buildFeedListItem(feed);
    ul.append(feedEl);
  });

  return ul;
};
const markPostRead = (state, post) => {
  state.readPosts = [...state.readPosts, post.id];
};

const buildPostsList = (posts, state) => {
  const buildItem = (post) => {
    const readPosts = target(state.readPosts);
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const link = document.createElement('a');

    link.classList.add(readPosts.find((readId) => readId === post.id) ? 'fw-normal' : 'fw-bold');
    // link.classList.add(readPosts.find((readId) => readId === post.id) ? 'fw-normal' : 'fw-bold');
    link.href = post.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = post.title;
    link.addEventListener('click', () => markPostRead(state, post));

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#article-preview';
    button.dataset.id = post.id;
    button.textContent = i18next.t('preview');
    button.addEventListener('click', () => {
      markPostRead(state, post);
      const { title } = post;
      const body = post.description;
      const url = post.link;
      state.modal = {
        title, body, url,
      };
    });

    li.append(link, button);

    return li;
  };

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach((post) => {
    ul.append(buildItem(post));
  });

  return ul;
};

const handleForm = (stateValue) => {
  const input = document.getElementById('url');
  const submit = document.getElementById('submit');
  input.classList.remove('is-invalid');
  submit.value = i18next.t('add');

  switch (stateValue) {
    case FILLING:
    case SUBMITTED:
      submit.disabled = false;
      input.value = '';
      input.readOnly = false;
      break;
    case SUBMITTING:
      submit.disabled = true;
      input.readOnly = true;
      break;
    case FAILED:
      submit.disabled = false;
      input.readOnly = false;
      input.classList.add('is-invalid');
      break;
    default:
      throw Error(`Unknown state: ${stateValue}`);
  }
};

const renderFeeds = (feeds) => {
  if (feeds.length === 0) {
    return;
  }

  const feedsContainer = document.getElementById('feeds');
  feedsContainer.innerHTML = '';

  const listTitle = document.createElement('h2');
  listTitle.textContent = i18next.t('feeds');
  const feedsList = buildFeedList(feeds);

  feedsContainer.append(listTitle, feedsList);
};

const renderPosts = (posts, state) => {
  if (posts.length === 0) {
    return;
  }

  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18next.t('posts');
  const postsList = buildPostsList(posts, state);

  postsContainer.append(postsTitle, postsList);
};

const handleModal = ({ title, body, url }) => {
  const titleEl = document.getElementById('article-preview-title');
  const bodyEl = document.getElementById('article-preview-body');
  const linkEl = document.getElementById('full-article');

  titleEl.textContent = title;
  bodyEl.textContent = body;
  linkEl.href = url;
};

const renderMessage = ({ type, text }) => {
  const submit = document.getElementById('submit');
  const feedback = document.getElementById('form-message') || document.createElement('div');

  feedback.id = 'form-message';
  feedback.classList.add('feedback');

  switch (type) {
    case SUCCESS:
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      break;
    case ERROR:
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;
    default:
      feedback.remove();
      return;
  }
  feedback.textContent = i18next.t(text);
  submit.after(feedback);
};

const render = (state, path, value) => {
  const submit = document.getElementById('submit');
  submit.value = i18next.t('add');

  switch (path) {
    case 'form.state':
      handleForm(value);
      break;
    case 'form.message':
      renderMessage(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value, state);
      break;
    case 'modal':
      handleModal(value);
      break;
    case 'readPosts':
      renderPosts(target(state.posts), state);
      break;
    default:
      break;
  }
};

export default render;
