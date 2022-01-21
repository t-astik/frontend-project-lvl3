/* eslint-disable no-param-reassign */
import { get } from 'axios';
import onChange from 'on-change';
import i18next from 'i18next';
import { uniqueId } from 'lodash';
import parse from './parser';
import validate from './validator';
import render from './render';
import resources from './locales';
import 'bootstrap';
import {
  FILLING,
  SUBMITTED,
  SUBMITTING,
  FAILED,
  PROXY_URL,
} from './constants.js';

const buildFeed = (rss, url) => {
  const convertItem = (item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const guid = item.querySelector('guid');
    const id = uniqueId();

    return {
      title, description, link, guid, id,
    };
  };
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent.trim();
  const posts = [];

  rss.querySelectorAll('channel > item').forEach((item) => {
    posts.push(convertItem(item));
  });

  return { feed: { title, description, url }, posts };
};

const loadPosts = (state, feed) => {
  const { url } = feed;
  get(PROXY_URL, { params: { url, disableCache: true } })
    .then((res) => {
      const parsed = parse(res.data.contents);
      const { posts: existPosts } = buildFeed(parsed, url);
      const newPosts = existPosts.filter((existPost) => {
        const newPostInExists = state.posts
          .find((storedPost) => storedPost.title === existPost.title);
        return newPostInExists === undefined;
      });

      if (newPosts.length === 0) {
        return;
      }

      state.posts = [...newPosts, ...state.posts];
    });
  setTimeout(() => loadPosts(state, feed), 5000);
};

export default () => i18next.init({
  lng: 'en',
  debug: false,
  resources,
}).then(() => {
  const state = {
    form: {
      message: {
        type: null,
        text: '',
      },
      state: FILLING,
    },
    modal: {
      title: '',
      body: '',
      url: '',
    },
    feeds: [],
    posts: [],
    readPosts: [],
  };
  const watchedState = onChange(state, (path, value) => render(watchedState, path, value));
  const form = document.getElementById('rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = SUBMITTING;

    const formData = new FormData(e.target);
    const validationMessage = validate(formData.get('url'));

    if (validationMessage) {
      watchedState.form.state = FAILED;
      watchedState.form.message = {
        type: 'error',
        text: validationMessage,
      };

      return;
    }

    const url = formData.get('url');
    const alreadyExists = state.feeds.find((feed) => feed.url === url);

    if (alreadyExists) {
      watchedState.form.state = FAILED;
      watchedState.form.message = {
        type: 'error',
        text: 'exists',
      };

      return;
    }

    get(PROXY_URL, { params: { url, disableCache: 'true' } })
      .catch(() => {
        throw Error('network_error');
      })
      .then((res) => {
        try {
          const feedData = parse(res.data.contents);
          const { feed, posts } = buildFeed(feedData, url);
          watchedState.feeds = [feed, ...watchedState.feeds];
          watchedState.posts = [...posts, ...watchedState.posts];
          watchedState.form.state = SUBMITTED;
          watchedState.form.message = {
            type: 'success',
            text: 'success_load',
          };

          setTimeout(() => loadPosts(watchedState, feed), 5000);
        } catch (error) {
          throw Error('invalid_rss');
        }
      })
      .catch((error) => {
        watchedState.form.state = FAILED;
        watchedState.form.message = {
          type: 'error',
          text: error.message,
        };
      });
  });

  render(watchedState);
});
