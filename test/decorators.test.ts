import { initLoxer, trace } from '../src';

// TODO
test('initLoxer', () => {
  initLoxer({});
});
class Test {
  @trace('NONE') // @ts-ignore
  async method(num: number) {}
  @trace({
    moduleId: 'NONE',
    level: 1,
    highlight: 'all',
    argsAsItem: true,
    openMessage: 'args',
    closeMessage: 'result',
    resultAsItem: true,
  }) // @ts-ignore
  method2(num: number) {}
  @trace({ openMessage: 'functionName', closeMessage: 'functionName' }) // @ts-ignore
  fn(num: number) {}
  @trace({ openMessage: 'types', closeMessage: 'prettyResult' }) // @ts-ignore
  types(num: number) {}
  @trace({ openMessage: 'className.functionName', closeMessage: 'className.functionName' }) // @ts-ignore
  classFn(num: number) {}
  @trace({
    openMessage: (args) => JSON.stringify(args),
    closeMessage: (args) => JSON.stringify(args),
  }) // @ts-ignore
  fnfn(num: number) {}
}

// TODO
test('trace', async () => {
  const a = new Test();
  await a.method(42);

  a.method2(42);
  a.fn(42);
  a.types(42);
  a.classFn(42);
  a.fnfn(42);
});
