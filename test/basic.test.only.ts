// // direct object instantiation -------------------------------
// const o = {
//   name: 'Horst',
//   age: 65,
//   birthYear: (thisYear: number) => thisYear - o.age,
// };

// // function declaration --------------------------------------
// function f(param: string) {
//   console.log('f: ' + param);
// }
// f(JSON.stringify(o) + ' | bYear: ' + o.birthYear(2021));

// // (arrow) function declaration as constant
// const g = (param: string) => console.log('g: ' + param);
// g(JSON.stringify(o) + ' | bYear: ' + o.birthYear(2021));

// // functions as parameters (callbacks) -----------------------
// function randomCall(callback: (p: string) => void, times: number = 10) {
//   for (let i = 1; i <= times; i++) {
//     if (Math.random() < 0.5) {
//       callback('called randomly in step ' + i + '/' + times);
//     }
//   }
// }

// randomCall(g); // randomly calls f 3 times which always prints to the console

// // return objects with functions (Function chaining)----------
// function doThis() {
//   const thenThat = (withThisParam: string) => console.log(`this>that>${withThisParam}`);

//   return { thenThat };
// }

// doThis().thenThat('butWhy?'); // => this>that>butWhy

// test('', () => expect(true).toBeTruthy()); // placeholder test

// // -----------------------------------------------------------------------------
// // basic testing
// // -----------------------------------------------------------------------------

// test('1 + 2 = 3', () => {
//   expect(1 + 2).toBe(3);
// });

// test('empty string is falsy', () => {
//   expect('').toBeFalsy();
//   expect('something').toBeTruthy();
// });

// test('string matches "testing"', () => {
//   expect('testing').toMatch('testing');
//   // expect('concurrency').toMatch('testing');
// });

// test('exceptions', () => {
//   function failing() {
//     throw new Error('this cant just work');
//   }
//   expect(() => failing()).toThrow();
//   expect(() => failing()).toThrow('this cant just work');
// });

// // -----------------------------------------------------------------------------
// // Teardown and scope
// // -----------------------------------------------------------------------------

// let log = 'LOG:';
// let count = 0;
// beforeEach(() => (log += `\n > beforeEach ${++count}`));
// afterEach(() => (log += `\n < afterEach ${count}\n`));
// beforeAll(() => (log += '\n>>> beforeAll\n'));
// afterAll(() => {
//   log += '\n<<< afterAll';
//   console.log(log);
// });

// // -----------------------------------------------------------------------------
// // mocking
// // -----------------------------------------------------------------------------

// // for example: this function fetches a list of numbers from a server
// async function myComplexFunction(fetchParam: any) {
//   const result = await fetch(fetchParam);
//   const parsed = await result.json();

//   return parsed.numbers;
// }

// // const myComplexFunction = jest.fn((fetchParam: any) => [69, 42, 420]);

// // test('mocking', () => {
// //   const fetchedNumbers = myComplexFunction('blabla');
// //   expect(fetchedNumbers).toContain(42);
// //   expect(fetchedNumbers.length).toBeGreaterThan(0);
// // });
