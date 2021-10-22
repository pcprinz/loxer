import { initLoxer, trace } from '../src';

// TODO
test('initLoxer', () => {
  initLoxer({});
});
class Test {
  @trace('NONE') // @ts-ignore
  async method() {
    console.log('Worked');
  }
  @trace({
    moduleId: 'NONE',
    level: 1,
    highlight: 'all',
    argsAsItem: true,
    openMessage: 'args',
    closeMessage: 'result',
    resultAsItem: true,
  }) // @ts-ignore
  method2() {
    console.log('Worked');
  }
  @trace({ openMessage: 'functionName', closeMessage: 'functionName' }) // @ts-ignore
  fn() {}
  @trace({ openMessage: 'types', closeMessage: 'prettyResult' }) // @ts-ignore
  types() {}
  @trace({ openMessage: 'className.functionName', closeMessage: 'className.functionName' }) // @ts-ignore
  classFn() {}
}

// TODO
test('trace', async () => {
  const a = new Test();
  await a.method();

  a.method2();
  a.fn();
  a.types();
  a.classFn();
});
