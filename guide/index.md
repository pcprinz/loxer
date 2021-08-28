# Usage

## Simple initialization
- TODO options
- more in the coming sections

----------------------------------------------------------------------------------------------------

## Simple logs
To make a simple log, all you have to do is call `Loxer.log(message: string, item?: any)`. In the default - unless otherwise specified in `Loxer.init(options.callbacks)` - `message` and `item` are logged with `console.log(message, item)`. All you have to do is replacing `console`with `Loxer`.

Example
```typescript
const person = {name: "John Doe", age: 69};
console.log('This is the person:', person);  // => This is the person: { name: 'John Doe', age: 69 }
Loxer.log('This is the person:', person);    // => This is the person: { name: 'John Doe', age: 69 }
```

To see what `item` does take a look at the [MDN Web API](https://developer.mozilla.org/de/docs/Web/API/Console/log)

> Loxer comes with some improvements:
> - Logs can be highlighted.
> - Logs can be given levels.
> - Logs can be categorized in modules.
> - Logs can be distributed to different output streams.

----------------------------------------------------------------------------------------------------

## Simple error logs
TODO

----------------------------------------------------------------------------------------------------

## Highlighting
Highlighting logs has the advantage of being able to view a certain log relatively quickly from a large number of logs. To highlight a log, it just needs to be chained with `.highlight()` or `.h()`, with the last one being a shortcut. The output message will then have inverted background and text colors.

Example
```typescript
Loxer.highlight().log('this will be seen easily');
Loxer.h().log('this too');

// conditionally highlight
const shouldHighlight = Math.random() > 0.5;
// the methods accept an optional boolean parameter
Loxer.h(shouldHighlight).log('This message will be conditionally highlighted');
```

> - The highlight methods can be chained with **any other logging** method like `Loxer.error()`, `Loxer.open()` and `Loxer.of()`.
> - They can also be chained with **any other chaining method** like `.level()` and `module()` in **any order**.
> - The highlighting will only take effect on the `colored.message` property on the output streams logs / errors.

----------------------------------------------------------------------------------------------------

## Levels
Giving levels is a common feature for any logger. Loxer provides a simple, but extendable solution for this case.

### Levels on logs
Adding levels to logs is done in the same way as highlighting. Therefore you have to chain them with `level(level: number)` or `l(level: number)`.

Possible Levels are `type LogLevelType = 1 | 2 | 3` where 1 = high, 2 = medium and 3 = low.

Example
```typescript
Loxer.level(3).log('this log has the level 3 = low');
Loxer.l(2).log('this has the level 2 = medium');
Loxer.l(1).log('this has the default level 1 = high');
Loxer.log('this too, because 1 is default');
```

> You can also add levels to the logging methods `Loxer.open()` and `Loxer.of()`. Giving `Loxer.error()` a level is no problem, but has no effect on whether it is logged. It always will.

### Default levels (and module levels)
Providing logs with levels would make no sense if you couldn't set which level the logger should display / log. Therefore you have to declare the levels as part of the `LoxerOptions` when you initialize `Loxer`.


Example
```typescript
Loxer.init({
    defaultLevels: {
      develLevel: 3,  // the level in development environment
      prodLevel: 1,   // the level in production environment
  }
});
```
      
Possible levels for Loxer and modules are `export type LevelType = 0 | 1 | 2 | 3;`, where 1, 2 and 3 like `LogLevelType` and 0 = no output.

The default levels for logs are `1` (high) for development environment and `0` (off) for production environment. These will be used if any logging method is used without assigning a module.

If you declare modules then you can set separate levels for every module, giving you the opportunity to separate their logging density from each other.

> Setting the `prodLevel` to `0` (off) is an easy way of disabling logs in the production environment, though even without declared outputStreams the `console` will never be used.

----------------------------------------------------------------------------------------------------

## Modules
Modules are one way of categorizing logs in order to:
- To create clarity in the output (with coloring)
- Set log levels for individual categories
- Detect possible dependencies on services / domains
- focussing error detection on the dedicated parts of your application

### Modules on logs
Assigning modules to logs is again done in the same way as highlighting or leveling. Therefore you have to chain them with the `.module(moduleId: string)` or `.m(moduleId: string)`

Example
```typescript
Loxer.module('PERS').log('this log is assigned to the module with the key PERS');
Loxer.m('PERS').log('this too');
Loxer.m().log('this one is automatically assigned to the module DEFAULT');
Loxer.log('this one is automatically assigned to the module NONE')
```

> The module methods can be chained with the logging methods `Loxer.error()` and `Loxer.open()`. Assigning a module to `Loxer.of()` is no problem, but has no effect. `.of()` logs always receive the module from their opening log.

### Declaring modules
Modules must be declared as part of the `LoxerOptions` when you initialize `Loxer`. Therefore the `options.modules` must receive an object of `type LoxerModules = { [moduleId: string]: Module }`, where the `moduleId` is the key that will be referenced in the `.m()` and `.module()` methods.

A `Module` must be structured as `{ develLevel: LevelType; prodLevel: LevelType; fullname: string; color: string; }`. The two levels are of the same type as the `defaultLevels` and the `fullName` and `color` will be used for the output.

The `color` must be either structured in HEX (`'#ff1258'`) or RGB format (`'rgb(255, 0, 0)'`) that will be interpreted by the [color](https://www.npmjs.com/package/color) package.

Example
```typescript
Loxer.init({
  modules: {
    PERS: { color: '#f00', fullname: 'Persons', develLevel: 1, prodLevel: 1 },
    CART: { color: '#00ff00', fullname: 'Shopping cart', develLevel: 1, prodLevel: 1 },
    BILL: { color: 'rgb(0, 0, 255)', fullname: 'Billing', develLevel: 1, prodLevel: 1 }
  }
});
```

> - You are free to set any string key for a `moduleId`, but it will be efficient to choose short ones, because you probably have to write them often.

### Default modules
There are 3 default modules, that are predefined:
```typescript
export const DEFAULT_MODULES: LoxerModules = {
  NONE: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 0 },
  DEFAULT: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 0 },
  INVALID: { fullname: 'INVALIDMODULE', color: '#f00', develLevel: 1, prodLevel: 0 }
};
```

The `NONE` module is automatically assigned when there is no module method chained in a logging method. The output will have no box layout and no module name as prefix.

The `DEFAULT` module is automatically assigned, when logs are chained with an empty module method like `.m()`. The output will have a boxlayout and an empty module name.

The `INVALID` module is automatically assigned, when logs are tried to be assigned with non existing modules (giving false moduleIds). The output will have no boxlayout, but the prominent fullname as module name.

> All default modules can be redefined in the `options.modules` by overwriting their keys.
> - **ATTENTION**: beware of forcefully setting any of these modules to a falsy value like `null` or `undefined` because this will definitely cause Loxer to crash.
> - If you want to disable them, set their levels to `0`. 

----------------------------------------------------------------------------------------------------

## Output steams / Callbacks
TODO

# Creating Boxes
TODO
# Use cases
- visualize data flows
  - performance analysis
- refactor console
- error detection / handling / reporting