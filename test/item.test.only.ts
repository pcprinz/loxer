import { Loxer, resetLoxer } from '../src';
import { OutputStreams } from '../src/core/OutputStreams';
import { OutputLox, ErrorLox } from '../src/loxes';

let devLogs: OutputLox[] = [];
function devLog(log: OutputLox) {
  devLogs.push(log);
}
let prodLogs: OutputLox[] = [];
function prodLog(log: OutputLox) {
  prodLogs.push(log);
}
let devErrors: ErrorLox[] = [];
function devError(log: ErrorLox, history: (OutputLox | ErrorLox)[]) {
  devErrors.push(log);
  histories.push(history);
}
let prodErrors: ErrorLox[] = [];
function prodError(log: ErrorLox, history: (OutputLox | ErrorLox)[]) {
  prodErrors.push(log);
  histories.push(history);
}
let histories: (OutputLox | ErrorLox)[][] = [];
const item = [
  [1, 2, 3],
  1,
  'str',
  false,
  Symbol('sym'),
  12345678901234567890n,
  {
    key: 'value',
    arr: [
      {
        name: 'horst',
        age: 66,
      },
      {
        name: 'gunter',
        age: 8,
      },
      [1, 2, 3],
      1,
      'str',
      false,
      Symbol('sym'),
      12345678901234567890n,
      (a: string) => {},
      String,
      String(2),
      null,
      undefined,
      Loxer.init,
    ],
    obj: {
      tes: 't',
      num: 'ber',
      a: '123456789',
      b: '123456789',
      c: '123456789',
      d: '123456789',
      nested: {
        a: 2,
        b: 3,
      },
    },
  },
  {
    key: 'value',
    name: 'horst',
    age: 66,
    a: 123456789,
    b: 1234567891,
    c: 123456789,
    d: 123456789,
    e: 123456789,
    f: 123456789,
  },
  (a: string) => {},
  String,
  String(2),
  null,
  undefined,
  Loxer.init,
];
beforeEach(() => {
  Loxer.init({
    dev: true,
    callbacks: {
      devError,
      devLog,
      prodError,
      prodLog,
    },
    defaultLevels: {
      devLevel: 2,
      prodLevel: 0,
    },
    modules: {
      TEST: { color: '#ff0', devLevel: 1, prodLevel: 0, fullName: 'TestModule' },
    },
    config: {
      moduleTextSlice: 10,
      historyCacheSize: 50,
    },
  });
});

afterEach(() => {
  devLogs = [];
  devErrors = [];
  histories = [];
  resetLoxer();
});

afterAll(() => {
  devLogs.forEach((dl) => {
    OutputStreams;
  });
});

test('item', () => {
  expect(true).toBeTruthy();
  Loxer.log('TEST-ITEM', item);
});
