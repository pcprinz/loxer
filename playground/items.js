const { Loxer, BoxLayouts, BoxFactory } = require('../dist');

Loxer.init({
  dev: true,
  modules: {
    ACC: { color: '#f00', fullName: 'Persons', devLevel: 1, prodLevel: 1 },
    CART: { color: '#00ff00', fullName: 'Shopping cart', devLevel: 1, prodLevel: 1 },
    PAY: { color: 'rgb(0, 120, 255)', fullName: 'Payment', devLevel: 1, prodLevel: 1 },
  },
});

function logSpace(lines) {
  let nls = '';
  for (let i = 0; i < lines; i++) {
    nls += '\n';
  }
  console.log(nls);
}

// ######################################################################

logSpace(3);

const invoice = {
  date: new Date('2021-11-30T23:35:46.926Z'),
  a: new BoxFactory('light'),
  b: {
    plain: 'object',
  },
};

const a1 = Loxer.m('ACC').open('login');
Loxer.of(a1).add('authenticate user');
const c1 = Loxer.m('CART').open('restore last order session');
Loxer.of(a1).close('login successful');
Loxer.of(c1).add('payment pending');
const p1 = Loxer.m('PAY').open('restore last order invoice', Loxer, { shortenClasses: true });
Loxer.of(p1).error('failed to restore last invoice', invoice);
Loxer.of(p1).close('no invoice restored');
Loxer.of(c1).close('session restored');

logSpace(3);
