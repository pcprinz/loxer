import { Loxer, resetLoxer } from '../dist';
import { ErrorLox, OutputLox } from '../dist/loxes';

let devLogs: OutputLox[] = [];
function devLog(log: OutputLox) {
  devLogs.push(log);
  devOut.push(log);
}
let prodLogs: OutputLox[] = [];
function prodLog(log: OutputLox) {
  prodLogs.push(log);
}
let devErrors: ErrorLox[] = [];
function devError(log: ErrorLox, history: (OutputLox | ErrorLox)[]) {
  devErrors.push(log);
  devOut.push(log);
  histories.push(history);
}
let prodErrors: ErrorLox[] = [];
function prodError(log: ErrorLox, history: (OutputLox | ErrorLox)[]) {
  prodErrors.push(log);
  histories.push(history);
}
let histories: (OutputLox | ErrorLox)[][] = [];
let devOut: (OutputLox | ErrorLox)[] = [];

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
      develLevel: 2,
      prodLevel: 0,
    },
    modules: {
      ONE: { color: '#ff0', develLevel: 1, prodLevel: 0, fullname: 'Module 1' },
      TWO: { color: '#00f', develLevel: 2, prodLevel: 0, fullname: 'Module 2' },
    },
    config: {
      moduleTextSlice: 10,
      historyCacheSize: 50,
    },
  });
});

afterEach(() => {
  devOut = [];
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

// Testing function ###########################################################

function checkBoxes(expected: string[]) {
  expect(devOut.length).toBe(expected.length + 1);
  expect(devOut[0].message).toBe('Loxer initialized');
  expect(devOut[0].type).toBe('single');
  expect(devOut[0].moduleId).toBe('NONE');

  for (let i = 0; i < expected.length; i++) {
    const log = devOut[i + 1];
    const message = log.message;
    const type = log.type;
    const mod = log.moduleId;
    const box = log.box
      .map((seg) => {
        if (seg === 'empty') {
          return ' ';
        } else {
          switch (seg.box) {
            case 'vertical':
              return '|';
            case 'closeEnd':
            case 'openEnd':
            case 'horizontal':
              return '-';
            case 'cross':
              return 'x';
            case 'closeEdge':
              return '>';
            case 'openEdge':
              return '<';
            case 'single':
              return 'T';
            default:
              return '';
          }
        }
      })
      .join('');
    expect(expected[i]).toBe(type + '.' + mod + '.' + box + message);
  }
}

// TESTS ######################################################################

test('simple boxing', () => {
  const id = Loxer.open('open');
  Loxer.of(id).add('add');
  Loxer.of(id).error('error');
  Loxer.of(id).close('close');

  expect(devLogs.length).toBe(4);
  expect(devErrors.length).toBe(1);
  expect(devErrors[0].error).toBeInstanceOf(Error);
  expect(devErrors[0].error.message).toStrictEqual(devErrors[0].message);
  expect(devErrors[0].error.name).toBe('Error');

  /* 
  ╭← open
  ├─ add
  ├─ Error: error
  ╰→ close
  */
  checkBoxes([
    'open.DEFAULT.<-open',
    'single.DEFAULT.T-add',
    'error.DEFAULT.T-error',
    'close.DEFAULT.>-close',
  ]);
});

test('sequential boxing', () => {
  const id1 = Loxer.open('open');
  Loxer.of(id1).add('add');
  Loxer.of(id1).error('error');
  Loxer.of(id1).close('close');
  const id2 = Loxer.open('open2');
  Loxer.of(id2).add('add2');
  Loxer.of(id2).close('close2');
  /* 
  ╭← open
  ├─ add
  ├─ Error: error
  ╰→ close
  ╭← open2
  ├─ add2
  ╰→ close2
  */
  checkBoxes([
    'open.DEFAULT.<-open',
    'single.DEFAULT.T-add',
    'error.DEFAULT.T-error',
    'close.DEFAULT.>-close',
    'open.DEFAULT.<-open2',
    'single.DEFAULT.T-add2',
    'close.DEFAULT.>-close2',
  ]);
});

test('nested boxing', () => {
  const id1 = Loxer.open('open');
  const id2 = Loxer.open('open2');
  Loxer.of(id2).add('add2');
  Loxer.of(id2).close('close2');
  Loxer.of(id1).add('add');
  Loxer.of(id1).error('error');
  Loxer.of(id1).close('close');
  /* 
  ╭← open
  │╭← open2
  │├─ add2
  │╰→ close2
  ├─ add
  ├─ Error: error
  ╰→ close
  */
  checkBoxes([
    'open.DEFAULT.<-open',
    'open.DEFAULT.|<-open2',
    'single.DEFAULT.|T-add2',
    'close.DEFAULT.|>-close2',
    'single.DEFAULT.T-add',
    'error.DEFAULT.T-error',
    'close.DEFAULT.>-close',
  ]);
});

test('async boxing', () => {
  const id1 = Loxer.open('open');
  Loxer.of(id1).add('add');
  const id2 = Loxer.open('open2');
  Loxer.of(id1).error('error');
  Loxer.of(id2).add('add2');
  Loxer.of(id1).close('close');
  Loxer.of(id2).close('close2');
  /*
  ╭← open
  ├─ add
  │╭← open2
  ├┆─ Error: error
  │├─ add2
  ╰┆→ close
   ╰→ close2
  */
  checkBoxes([
    'open.DEFAULT.<-open',
    'single.DEFAULT.T-add',
    'open.DEFAULT.|<-open2',
    'error.DEFAULT.Tx-error',
    'single.DEFAULT.|T-add2',
    'close.DEFAULT.>x-close',
    'close.DEFAULT. >-close2',
  ]);
});

test('highlighting', () => {
  const id = Loxer.h().open('open');
  Loxer.h().of(id).close('close');

  expect(devLogs.length).toBe(3);
  expect(devLogs[1].highlighted).toBeTruthy();
  expect(devLogs[2].highlighted).toBeTruthy();

  /* 
  ╭← open
  ╰→ close
  */
  checkBoxes(['open.DEFAULT.<-open', 'close.DEFAULT.>-close']);
});

test('leveling', () => {
  const id1 = Loxer.open('open');
  const id2 = Loxer.l(3).open('open2');
  // append to not existing box
  Loxer.l(1).of(id2).add('add2');
  // auto level 3
  Loxer.of(id2).close('close2');
  Loxer.l(3).of(id1).add('add');
  // no leveling on errors
  Loxer.l(3).of(id1).error('error');
  Loxer.l(2).of(id1).close('close');

  expect(devLogs.length).toBe(3);
  expect(devErrors.length).toBe(1);

  /* 
  ╭← open
//│╭← open2        [UNLEVELED]
//│├─ add2         [UNLEVELED automatically]
//│╰→ close2       [UNLEVELED automatically]
//├─ add           [UNLEVELED]
  ├─ Error: error  [LEVELED but shown! ]
  ╰→ close
  */
  checkBoxes(['open.DEFAULT.<-open', 'error.DEFAULT.T-error', 'close.DEFAULT.>-close']);
});

test('module boxing', () => {
  const id1 = Loxer.m('ONE').open('open');
  Loxer.m('ONE').of(id1).add('add');
  const id2 = Loxer.m('TWO').open('open2');
  Loxer.m('ONE').of(id1).error('error');
  Loxer.m('TWO').of(id2).add('add2');
  Loxer.m('ONE').of(id1).close('close');
  Loxer.m('TWO').of(id2).close('close2');
  const id3 = Loxer.m('ONE').l(2).open('open3');
  Loxer.m('ONE').of(id3).error('error3');
  Loxer.m('ONE').of(id3).close('close3');
  /*
  ╭← open
  ├─ add
  │╭← open2       
  ├┆─ Error: error  
  │├─ add2          
  ╰┆→ close         
   ╰→ close2       
//╭← open3          [unleveled]
  - error            [leveled automatically]
//╰→ close3         [unleveled automatically]
  */
  checkBoxes([
    'open.ONE.<-open',
    'single.ONE.T-add',
    'open.TWO.|<-open2',
    'error.ONE.Tx-error',
    'single.TWO.|T-add2',
    'close.ONE.>x-close',
    'close.TWO. >-close2',
    'error.ONE.-error3',
  ]);
});
