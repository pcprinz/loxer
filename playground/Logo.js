const { Loxer } = require('../dist');

Loxer.init({
    config: {
        moduleTextSlice: 16,
        endTitleOpacity: 0.8,
    },
  modules: {
    OUT: {
      color: '#f00',
      fullname: 'output streams',
      develLevel: 1,
      prodLevel: 1,
    },
    LOG: { color: '#0f0', fullname: 'set levels', develLevel: 1, prodLevel: 1 },
    SEE: {
      color: '#00f',
      fullname: 'see dataflow',
      develLevel: 1,
      prodLevel: 1,
    },
    TRACE: {
      color: '#ff0',
      fullname: 'trace methods',
      develLevel: 1,
      prodLevel: 1,
    },
    TIME: {
      color: '#f0f',
      fullname: 'time consumption',
      develLevel: 1,
      prodLevel: 1,
    },
    ERROR: {
      color: '#0ff',
      fullname: 'error handling',
      develLevel: 1,
      prodLevel: 1,
    },
    CAT: {
      color: '#fff',
      fullname: 'log categories',
      develLevel: 1,
      prodLevel: 1,
    },
    BOX: { color: '#fa0', fullname: 'box layout', develLevel: 1, prodLevel: 1 },
  },
});

const logo = [
  '                                                         ',
  '   ###          #####    ###   ###  #########  #######   ',
   '  ###         #######    ### ###   ###        ###   ### ',
   '  ###        ###   ###    #####    ###        ###   ### ',
    ' ###        ###   ###     ###     #######    #######   ',
     '###        ###   ###    #####    ###        ### ###   ',
     '#########   #######    ### ###   ###        ###  ###  ',
     '#########    #####    ###   ###  #########  ###   ### ',
     '                                                      ',
     'Logger, Tracer and ... Box?  -->  Loxer!              ',
    '  ... ah yes, and Error detector / dataflow visualizer ',
  '       ... and many other fancy buzz words!              ',
];

Loxer.log('\n\n')
const box = Loxer.m('BOX').open(logo[0]);
Loxer.m('LOG').log(logo[1]);
const see = Loxer.m('SEE').open(logo[2]);
Loxer.of(box).add(logo[3]);
const trace = Loxer.m('TRACE').open(logo[4]);
const error = Loxer.m('ERROR').open(logo[5]);
Loxer.m('TIME').log(logo[6]);
Loxer.m('CAT').log(logo[7]);
Loxer.of(see).close(logo[8]);
Loxer.of(error).close(logo[9]);
Loxer.of(trace).close(logo[10]);
Loxer.of(box).close(logo[11]);
Loxer.error('\t\t\tI always do the catchiest slogans')
Loxer.log('\n\n')
