import { NamedError } from '../src';
import { LoxerError } from '../src/core/Error';

// TODO
test('NamedError', () => {
  const str = new NamedError('TestError', 'string test', 'string');
  const num = new NamedError('TestError', 'num test', 3);
  const boo = new NamedError('TestError', 'boolean test', false);
  const err = new NamedError('TestError', 'error test', new RangeError('range'));
  const obj = new NamedError('TestError', 'object test', { fail: 'object' });
  const empty = new NamedError('TestError', 'non existing error');
});
