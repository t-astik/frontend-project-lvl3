/* eslint-disable no-useless-escape */
import '@testing-library/jest-dom';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import nock from 'nock';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import init from '../src/init';

axios.defaults.adapter = require('axios/lib/adapters/http');

const proxyurl = 'https://hexlet-allorigins.herokuapp.com/';
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');
nock.disableNetConnect();

const applyNock = (url, response, statusCode = 200) => {
  const encodeURI = encodeURIComponent(url);
  nock(proxyurl).persist().get(new RegExp(encodeURI)).reply(statusCode, response);
};
const elements = {};
const rss = readFile('rssinput.xml');
const rssUrl = 'https://ru.hexlet.io/lessons.rss';

beforeEach(async () => {
  const pathToHtml = path.resolve(__dirname, '..', 'index.html');
  const html = fs.readFileSync(pathToHtml, 'utf-8');
  document.body.innerHTML = html;

  elements.input = screen.getByLabelText('url');
  elements.submit = screen.getByLabelText('add');
  init();
});

test('rss has been loaded', async () => {
  applyNock(rssUrl, { contents: rss });
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/Rss has been loaded/i)).toBeInTheDocument();
});

test('unique', async () => {
  applyNock(rssUrl, { contents: rss });
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/Rss has been loaded/i)).toBeInTheDocument();
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/Rss already exists/i)).toBeInTheDocument();
});

test('invalid rss', async () => {
  applyNock('http://norss.ru', 'invalidrss');
  userEvent.type(elements.input, 'http://norss.ru');
  userEvent.click(elements.submit);
  expect(await screen.findByText(/This source doesn\'t contain valid rss/i)).toBeInTheDocument();
});

test('modal', async () => {
  applyNock(rssUrl, { contents: rss });
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  await screen.findByText(/Rss has been loaded/i);
  const previewBtns = await screen.findAllByRole('button', { name: /preview/i });
  userEvent.click(previewBtns[0]);
  expect(await screen.findByText('Cupidatat aliqua minim incididunt adipisicing officia proident quis pariatur fugiat consequat.')).toBeVisible();
});
