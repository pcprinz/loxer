import { Loxer, resetLoxer } from '../src';
import { Loxes } from '../src/core/Loxes';
import { Modules } from '../src/core/Modules';
import { ErrorLox, OutputLox } from '../src/loxes';
import { OutputStreams } from '../src/core/OutputStreams';
import { Lox } from '../src/loxes/Lox';
import { LoxHistory } from '../src/core/LoxHistory';

// mock console
global.console.log = jest.fn();
global.console.error = jest.fn();

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
      historyCacheSize: 1,
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

test('OutputStreams', () => {
  let os = new OutputStreams({ disableColors: true, endTitleOpacity: 1 });
  const ol = new OutputLox({
    highlighted: false,
    id: 0,
    item: 'item',
    level: 1,
    message: 'log',
    moduleId: 'NONE',
    type: 'open',
  });
  const cl = new OutputLox({
    highlighted: false,
    id: 0,
    item: undefined,
    level: 1,
    message: 'log',
    moduleId: 'NONE',
    type: 'close',
  });
  const el = new ErrorLox(
    new Lox({
      highlighted: false,
      id: 1,
      item: 'item',
      level: 1,
      message: 'error',
      moduleId: 'NONE',
      type: 'error',
    }),
    new Error('errorText')
  );
  const el2 = new ErrorLox(
    new Lox({
      highlighted: true,
      id: 2,
      item: undefined,
      level: 1,
      message: 'error2',
      moduleId: 'NONE',
      type: 'error',
    }),
    new Error('errorText2')
  );
  el.openLoxes = [ol, cl];
  el2.openLoxes = [ol, cl];
  const hy = new LoxHistory(1);
  hy.add(ol);
  hy.add(cl);
  os.logOut(true, ol);
  os.logOut(true, cl);
  os.logOut(false, cl);
  os.errorOut(true, el, hy);
  os.errorOut(true, el2, hy);
  os.errorOut(false, el2, hy);
  os = new OutputStreams({
    callbacks: {
      prodError: () => {},
      prodLog: () => {},
    },
  });
  os.logOut(true, cl);
  os.logOut(false, cl);
  os.errorOut(true, el2, hy);
  os.errorOut(false, el2, hy);
});

// TODO
test('Rest', () => {
  Loxer.init({ dev: false, config: { historyCacheSize: 1 }, callbacks: { devLog, devError } });
  const l = new Loxes();
  l.findOpenLox(Number('wrong'));

  const m = new Modules();
  m.getText(
    new Lox({
      highlighted: false,
      id: 0,
      item: undefined,
      level: 1,
      message: 'm',
      moduleId: 'wrong',
      type: 'single',
    })
  );
});
