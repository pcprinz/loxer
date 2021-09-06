import { Loxer, resetLoxer } from '../src/Loxer';

let testResults = '';
afterAll(() => console.log(testResults));

afterEach(() => {
  resetLoxer();
});

// logging when loxer disabled:
test('disabled', () => {
  Loxer.init({ config: { disabled: true } });
  boxes(58000000, 60, `58M logs when loxer disabled`);
});

// logging when logs don't fulfill level
test('unleveled', () => {
  Loxer.init({
    dev: false,
    defaultLevels: {
      prodLevel: 1,
      develLevel: 1,
    },
    config: {
      historyCacheSize: 0,
    },
  });
  boxes(9250, 60, `9250 unleveled logs`);
});

// logging when logs go to outputstream
test('blank output stream', () => {
  Loxer.init({
    dev: false,
    defaultLevels: {
      prodLevel: 3,
      develLevel: 3,
    },
    config: {
      historyCacheSize: 0,
    },
  });
  boxes(1590, 60, `1590 logs (unprocessed)`);
});

// logging with console output (skipped though output is heavy)
test.skip('console', () => {
  Loxer.init({
    dev: true,
    defaultLevels: {
      prodLevel: 3,
      develLevel: 3,
    },
    config: {
      historyCacheSize: 0,
    },
  });
  boxes(444, 60, `444 console logs`);
});

// Test function

function boxes(count: number, depth = count, testName = '') {
  const startTime = new Date().getTime();
  let offset = 0;
  while (offset + depth < count) {
    for (let start = offset + 1; start <= offset + depth; start++) {
      Loxer.l(3).open('open log');
    }
    for (let middle = offset + 1; middle <= offset + depth; middle++) {
      Loxer.of(middle).add('append to log');
      Loxer.of(middle).error('append an error to log1');
    }
    for (let end = offset + depth; end > offset; end--) {
      Loxer.of(end).close('close log');
    }
    offset += depth;
  }
  for (let start = offset + 1; start <= count; start++) {
    Loxer.l(3).open('open log');
  }
  for (let middle = offset + 1; middle <= count; middle++) {
    Loxer.of(middle).add('append to log');
    Loxer.of(middle).error('append an error to log2');
  }
  for (let end = count; end > offset; end--) {
    Loxer.of(end).close('close log');
  }
  const endTime = new Date().getTime();
  testResults += `${testName} last ${endTime - startTime}ms\n`;
}
