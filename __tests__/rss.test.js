import fs from 'fs';
import path from 'path';
import result from '../__fixtures__/rssoutput.js';
import parserRSS from '../src/parserRSS.js';

const getFixturePath = (filename) => path.join('__fixtures__', filename);

const pathTorrs = getFixturePath('rssinput.xml');
const rssXml = fs.readFileSync(pathTorrs);

test('RSS parser test', () => {
  expect(parserRSS(rssXml)).toMatchObject(result);
});
