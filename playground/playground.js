const {Loxer} = require('../dist');

Loxer.init();
Loxer.highlight().log('it works!', '...very well');
const lox = Loxer.m().open('look how it starts');
Loxer.of(lox).add('it is beautiful');
Loxer.of(lox).error('even the errors');
Loxer.of(lox).close('until the end');