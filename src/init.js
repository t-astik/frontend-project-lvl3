/* eslint-disable no-param-reassign */

import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import 'bootstrap';
import resources from './locales/index.js';
import parse from './parsers.js';
import initView from './view.js';

const addPosts = (posts, collection) => {
  const uniquedPosts = posts.map((item) => ({ ...item, id: _.uniqueId() }));
  collection.unshift(...uniquedPosts);
};

const getProxiedUrl = (url) => {
  const proxy = 'https://hexlet-allorigins.herokuapp.com';
  const params = { disableCache: true, url };

  const proxyUrl = new URL('/get', proxy);
  const searchParams = new URLSearchParams(params);
  proxyUrl.search = searchParams;

  return proxyUrl.toString();
};

// prettier-ignore
const getFeed = (url) => (
  axios.get(getProxiedUrl(url)).then(({ data }) => parse(data.contents, url))
);

const markAsReadHandle = (watchedState) => (evt) => {
  const { id } = evt.target.dataset;

  if (!id || watchedState.readPostsIds.has(id)) {
    return;
  }

  watchedState.readPostsIds.add(id);
  watchedState.lastReadPostId = id;
};

const rssAddHandle = (watchedState, validate) => (evt) => {
  evt.preventDefault();
  watchedState.form.state = null;

  const formData = new FormData(evt.target);
  const url = formData.get('url');

  const validateError = validate(url, watchedState.feeds);

  if (validateError !== null) {
    watchedState.form.error = validateError;
    watchedState.form.state = 'unvalid';

    return;
  }

  watchedState.process.state = 'getting';

  getFeed(url)
    .then((feed) => {
      watchedState.process.error = null;
      watchedState.process.state = 'finished';
      watchedState.feeds.push(_.omit(feed, 'items'));

      addPosts(feed.items, watchedState.posts);
    })
    .catch((error) => {
      if (error.isAxiosError) {
        watchedState.process.error = 'networkError';
      } else {
        watchedState.process.error = 'parserError';
      }

      watchedState.process.state = 'failed';
    });
};

const getNewPosts = (watchedState, delay) => {
  const promises = watchedState.feeds.map(({ link }) => getFeed(link));

  Promise.allSettled(promises)
    .then((results) => {
      const fulfilledFeeds = results
        .filter((result) => result.status === 'fulfilled')
        .map(({ value }) => value);

      fulfilledFeeds.forEach((incomingFeed) => {
        const { items: incomingPosts } = incomingFeed;
        const currentPosts = watchedState.posts;
        const newPosts = _.differenceBy(incomingPosts, currentPosts, 'link');

        if (_.isEmpty(newPosts)) {
          return;
        }

        addPosts(newPosts, currentPosts);
      });
    })
    .finally(() => {
      setTimeout(() => getNewPosts(watchedState, delay), delay);
    });
};

const init = (i18n) => {
  const schema = yup.string().url();
  const state = {
    process: {
      // ready, getting, finished, failed
      state: 'ready',
      error: null,
    },
    form: {
      // null, valid, unvalid
      state: null,
      error: null,
    },
    feeds: [],
    posts: [],
    lastReadPostId: null,
    readPostsIds: new Set(),
  };
  const elements = {
    modal: {
      main: document.querySelector('#modal'),
      title: document.querySelector('#modal .modal-title'),
      body: document.querySelector('#modal .modal-body'),
      redirect: document.querySelector('#modal a'),
    },
    form: {
      main: document.querySelector('form.rss-form'),
      input: document.querySelector('form.rss-form input'),
      button: document.querySelector('form.rss-form button'),
    },
    feeds: document.querySelector('.container-fluid .feeds'),
    posts: document.querySelector('.container-fluid .posts'),
    feedback: document.querySelector('.container-fluid .feedback'),
  };

  const validate = (url, collection) => {
    const feedLinks = collection.map(({ link }) => link);

    try {
      schema.notOneOf(feedLinks).validateSync(url);
      return null;
    } catch (error) {
      return error;
    }
  };

  const watchedState = initView(elements, state, i18n);

  elements.form.main.addEventListener('submit', rssAddHandle(watchedState, validate));
  elements.posts.addEventListener('click', markAsReadHandle(watchedState));

  return watchedState;
};

export default () => {
  const defaultLanguage = 'ru';
  const updateInterval = 5000;
  const i18n = i18next.createInstance();

  return i18n
    .init({
      lng: defaultLanguage,
      resources,
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: 'errors.unvalidUrl',
        },
        mixed: {
          notOneOf: 'errors.alreadyExist',
        },
      });

      return init(i18n);
    })
    .then((watchedState) => getNewPosts(watchedState, updateInterval));
};
