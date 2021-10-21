import { ANSIFormat, Box, BoxFactory } from '../src';
import { Loxes } from '../src/core/Loxes';
import { ErrorLox } from '../src/loxes/ErrorLox';
import { OutputLox } from '../src/loxes/OutputLox';

test('foreground coloring', () => {
  const fg = ANSIFormat.colorForeground(100, 100, 100);
  expect(fg).toBe('\x1b[38;2;100;100;100m');
  const fg2 = ANSIFormat.colorForeground(-1, -1, -1);
  expect(fg2).toBe('\x1b[38;2;0;0;0m');
  const fgWarn = ANSIFormat.fgWarn('TEXT');
  expect(fgWarn).toBe('\x1b[38;2;255;0;0mTEXT\x1b[0m');
  const fgSuccess = ANSIFormat.fgSuccess('TEXT');
  expect(fgSuccess).toBe('\x1b[38;2;20;200;0mTEXT\x1b[0m');
  const fgTime = ANSIFormat.fgTime('TEXT');
  expect(fgTime).toBe('\x1b[38;2;70;70;70mTEXT\x1b[0m');
  const fgCloseLog = ANSIFormat.fgCloseLog('TEXT');
  expect(fgCloseLog).toBe('\x1b[38;2;180;255;180mTEXT\x1b[0m');
  const colorized = ANSIFormat.colorize('TEXT', '');
  expect(colorized).toBe('\x1b[38;2;255;255;255mTEXT\x1b[0m');
});

test('background coloring', () => {
  const bg = ANSIFormat.colorBackground(256, 256, 256);
  expect(bg).toBe('\x1b[48;2;255;255;255m');
  const hl = ANSIFormat.colorHighlight('TEXT', '#647');
  expect(hl).toBe('\x1b[48;2;102;68;119mTEXT\x1b[0m');
  const hl2 = ANSIFormat.colorHighlight('TEXT');
  expect(hl2).toBe('\x1b[7mTEXT\x1b[0m');
  const bgWarn = ANSIFormat.bgWarn('TEXT');
  expect(bgWarn).toBe('\x1b[48;2;255;0;0m\x1b[38;2;255;255;255mTEXT\x1b[0m');
});

test('lox coloring', () => {
  const log1 = ANSIFormat.colorLox(lox1);
  expect(log1.message).toBe('\x1b[38;2;180;255;180mLox1!\x1b[0m');
  expect(log1.timeText).toBe('\x1b[38;2;70;70;70m123\x1b[0m');
  expect(log1.moduleText).toBe('\x1b[38;2;255;255;255mModule\x1b[0m');
  const log2 = ANSIFormat.colorLox(lox2);
  expect(log2.message).toBe('\x1b[7mLox2!\x1b[0m');
  expect(log2.timeText).toBe('\x1b[38;2;70;70;70m123\x1b[0m');
  expect(log2.moduleText).toBe('\x1b[38;2;255;255;255mModule\x1b[0m');
  lox3.highlighted = true;
  lox3.color = '#fff';
  lox3.moduleText = 'Module';
  lox3.setTime({ timeText: '123', timeConsumption: 123 });
  const log3 = ANSIFormat.colorLox(lox3, 0.6);
  expect(log3.message).toBe(
    '\x1b[48;2;255;0;0m\x1b[38;2;255;255;255mError\x1b[0m: \x1b[38;2;255;0;0mLox1!\x1b[0m'
  );
  expect(log3.timeText).toBe('\x1b[38;2;70;70;70m123\x1b[0m');
  expect(log3.moduleText).toBe('\x1b[38;2;153;153;153mModule\x1b[0m');
});

test('BoxLayout', () => {
  const bl = new BoxFactory('round');
  const loxes = new Loxes();
  loxes.proceed(lox0);
  lox1.hidden = true;
  const box1 = bl.getLogBox(lox1, loxes);

  bl.getOpenLogBox(lox0, loxes);
  lox0.moduleId = 'INVALID';
  bl.getOpenLogBox(lox0, loxes);
  const boxx: Box = ['empty', { box: 'vertical', color: 'red' }];

  const bs0 = bl.getBoxString(boxx, true);
  const bs1 = bl.getBoxString(boxx, false);
  const bs2 = bl.getBoxString(box1, false);
  expect(bs1).toBe(' │ ');
  expect(bs2).toBe('');
});

// loxes
const lox0 = new OutputLox({
  highlighted: false,
  id: 0,
  level: 0,
  message: 'Lox1!',
  moduleId: 'Module',
  type: 'open',
  item: undefined,
});
lox0.color = '#fff';
lox0.moduleText = 'Module';
lox0.setTime({ timeText: '123', timeConsumption: 123 });

const lox1 = new OutputLox({
  highlighted: false,
  id: 0,
  level: 0,
  message: 'Lox1!',
  moduleId: 'Module',
  type: 'close',
  item: undefined,
});
lox1.color = '#fff';
lox1.moduleText = 'Module';
lox1.setTime({ timeText: '123', timeConsumption: 123 });

const lox2 = new OutputLox({
  highlighted: true,
  id: 0,
  level: 0,
  message: 'Lox2!',
  moduleId: 'Module',
  type: 'single',
  item: undefined,
});
lox2.color = '#fff';
lox2.moduleText = 'Module';
lox2.setTime({ timeText: '123', timeConsumption: 123 });

const lox3 = new ErrorLox(lox1, new Error());
