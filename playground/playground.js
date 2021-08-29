const {Loxer} = require('../dist');

Loxer.init();
Loxer.highlight().log('it works!', '...very well');
const lox = Loxer.m().open('look how it starts');
Loxer.of(lox).add('it is beautiful');
Loxer.of(lox).error('even the errors');
Loxer.of(lox).close('until the end');


Loxer.error('this is a string error');
Loxer.error(404);
Loxer.error(false);
Loxer.error({ type: 'ServerError', code: 404 });
Loxer.error(new RangeError('this is a range error'));

// if using .highlight() on an error, then the stack ALWAYS will be printed:
Loxer.highlight().error('this is a highlighted error that prints the stack!!!');