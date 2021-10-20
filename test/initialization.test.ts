import { Loxer, resetLoxer } from '../src';
import { ErrorLox, OutputLox } from '../src/loxes';

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

afterEach(() => {
  devLogs = [];
  devErrors = [];
  histories = [];
  resetLoxer();
});

afterAll(() => {
  // prod output must be empty!
  expect(prodErrors.length).toBe(0);
  expect(prodLogs.length).toBe(0);
});

test('initialization', () => {
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
  expect(devLogs.length).toBe(1);
  expect(devLogs[0].message).toBe('Loxer initialized');
});

test('default init', () => {
  Loxer.init({ callbacks: { devLog, devError } });
  expect(devLogs.length).toBe('development' === process.env.NODE_ENV ? 1 : 0);
  'development' === process.env.NODE_ENV && expect(devLogs[0].message).toBe('Loxer initialized');
});

test('disabled init', () => {
  Loxer.init({ dev: true, config: { disabled: true }, callbacks: { devLog, devError } });
  expect(devLogs.length).toBe(0);
  // expect(devLogs[0].message).toBe('Loxer initialized');
});

test('disalbed logs', () => {
  Loxer.init({ config: { disabled: true } });
  const id = Loxer.open('disabled log');
  Loxer.of(id).add('add');
  Loxer.of(id).error('error');
  Loxer.of(id).close('close');

  expect(devLogs.length).toBe(0);
  expect(devErrors.length).toBe(0);
});

test('queueing logs', () => {
  const id = Loxer.open('disabled log which is queued');
  Loxer.of(id).add('add');
  Loxer.of(id).error('error');
  Loxer.of(id).close('close');

  expect(devLogs.length).toBe(0);
  expect(devErrors.length).toBe(0);

  Loxer.init({ dev: true, callbacks: { devLog, devError } });

  expect(devLogs.length).toBe(4);
  expect(devErrors.length).toBe(1);
});
