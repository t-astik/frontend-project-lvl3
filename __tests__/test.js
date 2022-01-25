/* eslint-disable jest/expect-expect */
import axios from 'axios';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import init from '../src/init.js';

axios.defaults.adapter = require('axios/lib/adapters/http');

nock.disableNetConnect();
// let elements;

beforeEach(async () => {
  const pathToFixture = path.join(__dirname, '..', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  await init();
});

test('should work', async () => {
  expect(screen.getByText('RSS агрегатор', { selector: 'h1' })).toBeInTheDocument();
  expect(screen.queryByText('Начните читать RSS сегодня! Это легко, это красиво.')).toBeInTheDocument();
  expect(screen.getByText(/Добавить/)).toBeEnabled();
});

test('submit url should work', async () => {
  const fixturePath = path.join(__dirname, '__fixtures__', 'lessons.rss');
  const contents = fs.readFileSync(fixturePath).toString();
  const scope = nock('https://hexlet-allorigins.herokuapp.com')

    .get('/get')
    .query({ url: 'https://ru.hexlet.io/lessons.rss', disableCache: 'true' })
    .reply(200, {
      contents,
    });

  const urlElement = screen.getByRole('textbox', { name: 'url' });
  const submitElement = screen.getByText(/Добавить/);

  await userEvent.type(urlElement, 'https://ru.hexlet.io/lessons.rss');
  userEvent.click(submitElement);
  expect(submitElement).toBeDisabled();

  await waitFor(() => {
    expect(document.body).toHaveTextContent('RSS успешно загружен');
  });

  scope.done();
  expect(document.body).toHaveTextContent('Новые уроки на Хекслете');
  expect(document.body).toHaveTextContent('Практические уроки по программированию');
  expect(document.body).toHaveTextContent('Формы / Основы вёрстки контента');
});

test('modal', async () => {
  const fixturePath = path.join(__dirname, '__fixtures__', 'lessons.rss');
  const contents = fs.readFileSync(fixturePath).toString();
  const scope = nock('https://hexlet-allorigins.herokuapp.com')

    .get('/get')
    .query({ url: 'https://ru.hexlet.io/lessons.rss', disableCache: 'true' })
    .reply(200, {
      contents,
    });

  const urlElement = screen.getByRole('textbox', { name: 'url' });
  const submitElement = screen.getByText(/Добавить/);

  await userEvent.type(urlElement, 'https://ru.hexlet.io/lessons.rss');
  userEvent.click(submitElement);
  expect(submitElement).toBeDisabled();

  await waitFor(() => {
    expect(document.body).toHaveTextContent('RSS успешно загружен');
  });

  scope.done();
  expect(document.body).toHaveTextContent('Новые уроки на Хекслете');

  const [previewButton] = screen.getAllByText(/Preview/i);
  userEvent.click(previewButton);
  expect(document.body).toHaveTextContent('Цель: Изучить создание одного из самых важных элементов на сайте — формы.');
});
