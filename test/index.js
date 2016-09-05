import * as assert from 'assert';
import {
  readdirSync as readdir,
  readFileSync as read,
  writeFileSync as write,
  statSync as stat
} from 'fs';
import {join, resolve} from 'path';

import {transform} from 'babel-core';
import testit from 'testit';

for (let category of readdir(join(__dirname, 'fixtures'))) {
  testit(category, () => {
    const catDir = join(__dirname, 'fixtures', category);
    const opts = require(join(catDir, 'options'));
    if (opts.plugins) {
      for (let [i, plugin] of opts.plugins.entries()) {
        if (plugin === 'with') {
          opts.plugins[i] = resolve(__dirname, '..', 'src');
        }
      }
    }

    for (let test of readdir(catDir).filter(t => stat(join(catDir, t)).isDirectory())) {
      testit(test, () => {
        let input = read(join(catDir, test, 'input.js'), 'utf8').trim();
        let actual = transform(input, opts).code.trim();
        write(join(catDir, test, 'actual.js'), actual + '\n');

        let expected;
        try {
          expected = read(join(catDir, test, 'expected.js'), 'utf8').trim();
        } catch (err) {
          write(join(catDir, test, 'expected.js'), actual + '\n');
          expected = actual;
        }
        assert.equal(actual, expected);
      });
    }
  });
}
