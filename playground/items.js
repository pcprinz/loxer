const { Loxer, BoxLayouts } = require('../dist');

Loxer.init({ dev: true });
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
      (a) => {},
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
        c: 4,
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
  (a) => {},
  String,
  String(2),
  null,
  undefined,
  Loxer.init,
];

console.log('TEST-ITEM', item);
Loxer.h().log('TEST-ITEM', item, { keys: ['a', 'nested', 'name'] });
Loxer.h().log('TEST-ITEM', 2);
