const { Loxer } = require('../dist');

// logging when loxer disabled:
// Loxer.init({config: {disabled: true}});
// boxes(100000000, 60);

// logging when logs don't fulfill level
Loxer.init({
  dev: false,
  defaultLevels: {
    prodLevel: 1,
    develLevel: 1,
  },
  config: {
    historyCacheSize: 100,
  },
});
boxes(100000, 60);

// logging when logs go to outputstream
// Loxer.init({
//   dev: false,
//   defaultLevels: {
//     prodLevel: 3,
//     develLevel: 3,
//   },
//   config: {
//     historyCacheSize: 50,
//   },
// });
// boxes(10000, 60);

// logging with console output
// Loxer.init({
//   dev: true,
//   defaultLevels: {
//     prodLevel: 3,
//     develLevel: 3,
//   },
//   config: {
//     historyCacheSize: 500,
//   },
// });
// boxes(2000, 60);

function boxes(count, depth = count) {
  console.log(`The following logging will be done ${count} times:`);
  const startTime = new Date().getTime();
  let offset = 0;
  while (offset + depth < count) {
    for (let start = offset + 1; start <= offset + depth; start++) {
      Loxer.l(3).open('open log');
    }
    for (let middle = offset + 1; middle <= offset + depth; middle++) {
      Loxer.of(middle).add('append to log');
      Loxer.of(middle).error('append an error to log1');
    }
    for (let end = offset + depth; end > offset; end--) {
      Loxer.of(end).close('close log');
    }
    offset += depth;
  }
  for (let start = offset + 1; start <= count; start++) {
    Loxer.l(3).open('open log');
  }
  for (let middle = offset + 1; middle <= count; middle++) {
    Loxer.of(middle).add('append to log');
    Loxer.of(middle).error('append an error to log2');
  }
  for (let end = count; end > offset; end--) {
    Loxer.of(end).close('close log');
  }
  const endTime = new Date().getTime();
  console.log(`... it lasts ${endTime - startTime}ms`);
  console.log('History: ' + JSON.stringify(Loxer.history.length));
}
