# Documentation
- [Documentation](#documentation)
- [Overview](#overview)
- [1. Initialization - `Loxer.init()`](#1-initialization---loxerinit)
- [2. Simple logs - `Loxer.log()`](#2-simple-logs---loxerlog)
- [3. Error logs - `Loxer.error()`](#3-error-logs---loxererror)
- [4. Highlighting - `Loxer.highlight()`](#4-highlighting---loxerhighlight)
- [5. Levels - `Loxer.level()`](#5-levels---loxerlevel)
- [6. Modules - `Loxer.module()`](#6-modules---loxermodule)
- [7. Output - `LoxerCallbacks`](#7-output---loxercallbacks)
- [8. Boxes](#8-boxes)


# Overview
Loxer's main goal is to increase the safety of applications by showing the developer the data flow of the application with the help of logs. For this, it is possible for him to provide logs with levels, to categorize them in modules, to expand error messages with additional information and to connect logs with one another. A box is created for this, which begins with an opening log, is continued with any number of logs and errors and ends with a closing log. This is then visualized with a kind of branching system. Loxer also serves as a middleware logger by allowing the user to determine the output streams himself using callbacks. In this way, it can be achieved, for example, that the behavior of an application in the production environment is recorded and, in the event of an error, detailed information about the cause is forwarded to an analysis service such as firebase crashlytics.

The following sections describe the use of Loxer in detail. Further information can be found in the [API Reference](https://pcprinz.github.io/loxer/index.html).

# 1. Initialization - [`Loxer.init()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#init)
In order to be able to use Loxer, it must first be initialized. To do this, the method `Loxer.init(options?: LoxerOptions)` must be called once. Loxer can be configured with [`LoxerOptions`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerOptions.html) during initialization. For the simple initialization, the optional options can also be left out.

###### Simple initialization
```typescript
Loxer.init();
```

This method can be called anywhere in your application.

> - There is also a method decorator `@initLoxer(options?: LoxerOptions)` that does the same thing.
> - It is recommended to declare a separate `const options: LoxerOptions` that is passed to the init method, because the more detailed the configuration, the larger the parameter.


### LoxerOptions:
Anyways, the options are an object with the following structure: 

```typescript
  // An object containing all loggable modules
  modules?: LoxerModules;
  // determines if Loxer is running in a development or production environment
  dev?: boolean;
  // Functions called as an output stream for Loxer 
  callbacks?: LoxerCallbacks;
  // The configuration of Loxer
  config?: LoxerConfig;
  // The default levels to show logs in production or development
  defaultLevels?: {
    // the actual level to show logs in development mode
    develLevel: LevelType;
    // the actual level to show logs in production mode
    prodLevel: LevelType;
  };
```

More about the details of the options can be found in the following sections.

<!-- ------------------------------------------------------------------------------------------- -->


# 2. Simple logs - [`Loxer.log()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#log)
To make a simple log, all you have to do is call `Loxer.log(message: string, item?: any)`. In the default - unless otherwise specified in `Loxer.init(options.callbacks)` - `message` and `item` are logged with `console.log(message, item)`. All you have to do is replacing `console` with `Loxer`.


###### Example
```typescript
const person = {name: "John Doe", age: 69};
console.log('This is the person:', person);  // => This is the person: { name: 'John Doe', age: 69 }
Loxer.log('This is the person:', person);    // => This is the person: { name: 'John Doe', age: 69 }
```


To see what `item` does take a look at the [MDN Web API](https://developer.mozilla.org/de/docs/Web/API/Console/log)

> Loxer comes with some improvements for logs:
> - Logs can be highlighted.
> - Logs can be given levels.
> - Logs can be categorized in modules.
> - Logs can be distributed to different output streams.
> - More on that in the sections about boxes and output.

<!-- ------------------------------------------------------------------------------------------- -->


# 3. Error logs - [`Loxer.error()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#error)
Creating simple error logs is analogous to a simple log. Therefore you write `Loxer.error(error: ErrorType, item?: any)`. By default this log will be proceeded to `console.error()`.

The error parameter must be of `type ErrorType = Error | string | number | boolean | object`, because these are the types that an error of a `catch(error)` phrase can take. The `item?: any` behaves the same way like in the `.log()` method.

###### Example
```typescript
Loxer.error('this is a string error');
Loxer.error(404);
Loxer.error(false);
Loxer.error({ type: 'ServerError', code: 404 });
Loxer.error(new RangeError('this is a range error'));

// if using .highlight() of .h() on an error, then the stack ALWAYS will be printed:
Loxer.highlight().error('this is a highlighted error that prints the stack!!!');
```

###### Console output

```console
Error: this is a string error
Error: 404
Error: false
Error: {"type":"ServerError","code":404}
RangeError: this is a range error
Error: this is a highlighted error that prints the stack!!!
    at Object.<anonymous> (C:\dev\loxer\playground\playground.js:18:19)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12)
    at node:internal/main/run_main_module:17:47
```

Loxer internally creates an `Error` out of any other message type than `Error` though it enables to get a Stack even if the thrown error has none.

> More on that in the sections about boxes and output.

<!-- ------------------------------------------------------------------------------------------- -->


# 4. Highlighting - [`Loxer.highlight()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#highlight)
<!-- TODO colored images -->
Highlighting logs has the advantage of being able to view a certain log relatively quickly from a large number of logs. To highlight a log, it just needs to be chained with `.highlight()` or `.h()`, with the last one being a shortcut. The output message will then have inverted background and text colors.

###### Example
```typescript
Loxer.highlight().log('this will be seen easily');
Loxer.h().log('this too');

// conditionally highlight
const shouldHighlight = Math.random() > 0.5;
// the methods accept an optional boolean parameter
Loxer.h(shouldHighlight).log('This message will be conditionally highlighted');
```

> - The highlight methods can be chained with **any other logging** method like `Loxer.error()`, `Loxer.open()` and `Loxer.of()`.
> - highlighting error logs will append the stack to the output stream
> - They can also be chained with **any other chaining method** like `.level()` and `module()` in **any order**.
> - The highlighting will only take effect on the `colored.message` property on the output streams logs / errors.

<!-- ------------------------------------------------------------------------------------------- -->


# 5. Levels - [`Loxer.level()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#level)
Giving levels is a common feature for any logger. Loxer provides a simple, but extendable solution for this case.

### Levels on logs
Adding levels to logs is done in the same way as highlighting. Therefore you have to chain them with `level(level: number)` or `l(level: number)`.

Possible Levels are `type LogLevelType = 1 | 2 | 3` where 1 = high, 2 = medium and 3 = low.

###### Example
```typescript
Loxer.level(3).log('this log has the level 3 = low');
Loxer.l(2).log('this has the level 2 = medium');
Loxer.l(1).log('this has the default level 1 = high');
Loxer.log('this too, because 1 is default');
```

> You can also add levels to the logging methods `Loxer.open()` and `Loxer.of()`. Giving `Loxer.error()` a level is no problem, but has no effect on whether it is logged. It always will.

### Default levels (and module levels)
Providing logs with levels would make no sense if you couldn't set which level the logger should display / log. Therefore you have to declare the levels as part of the [`LoxerOptions`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerOptions.html) when you initialize `Loxer`.


###### Example
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

<!-- ------------------------------------------------------------------------------------------- -->


# 6. Modules - [`Loxer.module()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#module)
<!-- TODO colored images -->
Modules are one way of categorizing logs in order to:
- To create clarity in the output (with coloring)
- Set log levels for individual categories
- Detect possible dependencies on services / domains
- focussing error detection on the dedicated parts of your application

### Modules on logs
Assigning modules to logs is again done in the same way as highlighting or leveling. Therefore you have to chain them with the `.module(moduleId: string)` or `.m(moduleId: string)`

###### Example
```typescript
Loxer.module('PERS').log('this log is assigned to the module with the key PERS');
Loxer.m('PERS').log('this too');
Loxer.m().log('this one is automatically assigned to the module DEFAULT');
Loxer.log('this one is automatically assigned to the module NONE')
```

> The module methods can be chained with the logging methods `Loxer.error()` and `Loxer.open()`. Assigning a module to `Loxer.of()` is no problem, but has no effect. `.of()` logs always receive the module from their opening log.

### Declaring modules
Modules must be declared as part of the [`LoxerOptions`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerOptions.html) when you initialize `Loxer`. Therefore the `options.modules` must receive an object of `type LoxerModules = { [moduleId: string]: Module }`, where the `moduleId` is the key that will be referenced in the `.m()` and `.module()` methods.

A [`Module`](https://pcprinz.github.io/loxer/interfaces/Loxer.Module.html) must be structured as `{ develLevel: LevelType; prodLevel: LevelType; fullname: string; color: string; }`. The two levels are of the same type as the `defaultLevels` and the `fullName` and `color` will be used for the output.

The `color` must be either structured in HEX (`'#ff1258'`) or RGB format (`'rgb(255, 0, 0)'`) that will be interpreted by the [color](https://www.npmjs.com/package/color) package.

###### Example
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
<!-- TODO images -->
###### There are 3 default modules, that are predefined:
```typescript
export const DEFAULT_MODULES: LoxerModules = {
  NONE: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 0 },
  DEFAULT: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 0 },
  INVALID: { fullname: 'INVALIDMODULE', color: '#f00', develLevel: 1, prodLevel: 0 }
};
```

The `NONE` module is automatically assigned when there is no module method chained in a logging method. The output will have no box layout and no module name as prefix.

The `DEFAULT` module is automatically assigned, when logs are chained with an empty module method like `.m()`. The output will have a box layout and an empty module name.

The `INVALID` module is automatically assigned, when logs are tried to be assigned with non existing modules (giving false moduleIds). The output will have no boxlayout, but the prominent fullname as module name.

> All default modules can be redefined in the `options.modules` by overwriting their keys.
> - **ATTENTION**: beware of forcefully setting any of these modules to a falsy value like `null` or `undefined` because this will definitely cause Loxer to crash.
> - If you want to disable them, set their levels to `0`. 

<!-- ------------------------------------------------------------------------------------------- -->


# 7. Output - [`LoxerCallbacks`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerCallbacks.html)
Loxer isn't just an extension for the console. It is an independent logger that in the default case uses the console as an output medium in the development environment. There are 4 different output streams available, which can be specified as `modules: LoxerCallbacks` in the `Loxer.init(options)`.

The `type LoxerCallbacks` has the following structure:
```typescript
{
  /** Function called when logging in development mode. */
  devLog?: (outputLog: OutputLox) => void;
  /** Function called when logging in production mode. */
  prodLog?: (outputLog: OutputLox) => void;
  /** Function called when errors are recorded in production mode. */
  prodError?: (errorLog: ErrorLox) => void;
  /** Function called when errors are recorded in development mode. */
  devError?: (errorLog: ErrorLox) => void;
}
```

Whenever a log with its level fulfills the requirements of the default levels or its module level, it is forwarded (depending on the environment) to the `devLog` or` prodLog` output stream. Error logs are always forwarded to the corresponding output stream (`devError` or `prodError`). You can tell Loxer the environment as `options.dev: boolean` in the `Loxer.init(options)`. In the default case it is `dev = process.env.NODE_ENV === 'development'`.

The `devLog` and `devError` callbacks default to printing the colored logs to the console. `prodLog` and `prodError` default to log nothing in order to keep the application clean in production environment. This is expressed in the fact that the production streams only interact with the user-specific ones and have no defaults.

In order to occupy a stream itself, the corresponding output log is passed to the callback.

### Output logs
To symbolize that the logs are more than just simple messages, they are named `* Lox`. There are two different types. In addition to the original message and item parameters, the [`OutputLox`](https://pcprinz.github.io/loxer/classes/Logs.OutputLox.html) contains the additional declared properties level, highlight and module. In addition, a time stamp and properties that arise from the box layout. [`ErrorLox`](https://pcprinz.github.io/loxer/classes/Logs.ErrorLox.html) have the same properties, but also carry information such as the `Error` that has occurred and properties that represent the log status during the occurrence of the error.

###### OutputLox
```typescript
{
  /** the internal identifier of the log */
  id: number;
  /** the message of the log */
  message: string;
  /** determines if the log was highlighted with `Loxer.highlight()` or `Loxer.h()` */
  highlighted: boolean;
  /** an optional item */
  item: any | Error | undefined;
  /** the type of the log */
  type: LoxType;
  /** the corresponding key of a module from `LoxerOptions.modules` */
  moduleId: string;
  /** the log level that was given with `Loxer.level(number)` or `Loxer.l(number)` */
  level: LevelType;
  /** the time the log appeared */
  timestamp: Date;
  /** the possibly sliced text of the logs corresponding module fullname */
  moduleText: string | '' = '';
  /** the box layout of the log */
  box: Box = [];
  /** a string that represents the time consumption from the opening log's `timestamp` until this log appeared */
  timeText: string | '' = '';
  /** the time consumption (in `ms`) from the opening log's `timestamp` until this log appeared */
  timeConsumption: number | undefined;
  /** The colored versions of the log's `message`, `moduleText`, `box` and `timeText` */
  colored: {
    message: string;
    moduleText: string | '';
    box: string | '';
    timeText: string | '';
  };
  /** determines if the log has not fulfilled the level that the corresponding module has set */
  hidden: boolean = false;
}
```

###### ErrorLox
```typescript
  // ... all the Properties from OutputLox +
  /** the error that was initially given, or created by Loxer */
  error: Error;
  /** a list of opened `OutputLox` which have not been closed until the occurrence of this error log */
  openLoxes: OutputLox[] = [];
  /** a full history of "all" `OutputLox` and `ErrorLox` which have occurred before this error log */
  history: (OutputLox | ErrorLox)[] = [];
```

> For more detailed information about the Lox's properties (as well as all other components of Loxer), a look at the [API reference](https://pcprinz.github.io/loxer/modules/Logs.html) is recommended.

### History
The history, which is attached to the `ErrorLox`, can also be accessed directly with [`Loxer.history`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#history). It is an inverted stack, which means that the most recent log is at `history [0]`. Only those logs / errors are recorded in the history, which (depending on the levels) are also directed into the output stream.

**IMPORTANT**: In the default case, the history is always empty for performance reasons. To "activate" it, its size must be specified as [`options.config.historyCacheSize`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerConfig.html#historyCacheSize) in the`Loxer.init (options)`.

> The history can be used if a user wants to send feedback on the behavior of the application. For this, however, the production levels must also be set accordingly.

### Callbacks
Now that we know how the output streams work and what the transferred `*Lox` look like, it is a good idea to take a look at how the `dev*` streams are used internally.

###### devLog internally
```typescript
private devLogOut(outputLox: OutputLox) {
  if (this._callbacks?.devLog) {
    this._callbacks.devLog(outputLox);
  } else {
    // colored option
    const { message, moduleText, timeText } = this._config?.disableColors
      ? outputLox
      : outputLox.colored;
    // here the box is stringified with unicode boy layouts
    const box = this.getBoxString(outputLox.box, !this._config?.disableColors);
    const str = moduleText + box + message + timeText;
    outputLox.item ? console.log(str, outputLox.item) : console.log(str);
  }
}
```

As you can see here, the `OutputLox` is forwarded unchanged to the `devLog` stream. The `else` branch (the default) shows how the `OutputLox` can be processed. The `ErrorLox` can be used in the same way:

###### devError internally
```typescript
private devErrorOut(errorLox: ErrorLox) {
  if (this._callbacks?.devError) {
    this._callbacks.devError(errorLox);
  } else {
    const { message, moduleText, timeText } = this._config?.disableColors
      ? errorLox
      : errorLox.colored;
    // here the box is stringified with unicode boy layouts
    const box = this.getBoxString(errorLox.box, !this._config?.disableColors);
    const msg = moduleText + box + message + timeText;
    const stack =
      errorLox.highlighted && errorLox.error.stack
        ? errorLox.error.stack
        : '';
    const openLogs =
      errorLox.highlighted && errorLox.openLoxes.length > 0
        ? `\nOPEN_LOGS: [${errorLox.openLoxes
            .map(outputLox => outputLox.message)
            .join(' <> ')}]`
        : '';

    errorLox.item
      ? console.error(msg + stack + openLogs, errorLox.item)
      : console.error(msg + stack + openLogs);
  }
}
```

The `prod*` streams are both just forwarded to the user callbacks. These can be used to interact with other 3rd party services like [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics/).


# 8. Boxes
<!-- TODO colored images -->
Another main feature of Loxer is the ability to visualize data flows. To do this, logs are combined into boxes by defining a start and an end log. Further logs as well as errors can be added between the two. In addition, the elapsed time since the opening log is measured for each log / error.

In addition, a box layout is created that shows the course of the box, but with the degree of nesting in relation to other boxes or individual logs. This enables connections between synchronous and asynchronous processes to be recognized and potential sources of error to be tracked down. Furthermore, it can easily be determined whether processes are not terminating, are taking too long, are too short, or are not being carried out at all.

### Create boxes

To use a box, it must be opened with `Loxer.open(message: string, item?: any)`. The `.open()` method returns the `id: number` of the log, which is used to connect other logs to this one. The rest of the structure and functionality is analogous to the `.log()` method. It can also be chained with `.highlight()`, `.level()` and `.module()`, just like the rest of the box methods. **As a reminder**, if the box layout is to be generated, **a module** or at least the default module (`.m()`) **must be assigned** to the log that opens.

###### Open a box - [`Loxer.open()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#open)
```typescript
const id = Loxer.module().open('this is an opening message')
```

If an open box is to be closed, or further logs / errors are to be added, the `Loxer.of(id: number)` method must be used. This method returns an object with 3 other methods, which enables the next method to be added as a chain. There are 3 methods available for this:
- `add(message: string, item?: any)` - adds a log to the box and works in the same way as `Loxer.log()`
- `error(error: ErrorType, item?: any)` - adds an error to the box and works in the same way as `Loxer.error()`
- `close(message: string, item?: any)` - closes the box and works in the same way as `Loxer.log()`

**ATTENTION**: calling `add()`, `error()` or `close()` after closing the box, the log will not be appended to the box but logged anyways with a Warning

###### Assigning / closing a box - [`Loxer.of()`](https://pcprinz.github.io/loxer/interfaces/Loxer.Loxer-1.html#of):
```typescript
const id = Loxer.m().open('This is the opening log');
Loxer.of(id).add('this is a single added log');
Loxer.of(id).error('this is an added error');
Loxer.of(id).close('this is the closing log');
```

> - When using `Loxer.of()`, `.level()` and `.module()` do not necessarily have to be specified again, since `.of()` automatically uses the values of the opening log as default.
> - Otherwise, `.level()` can be chained **before** the `.of`.
> - It is not possible to specify a different `.module()`, since **always** the module of the opening log is used!

### The Box Layout
The box layout which is output to the console by default consists of unicode box drawing characters. For this purpose, during the processing of the log, it is determined which row of characters belongs to a log. In addition, the characters are assigned the colors of the respective modules. The resulting list is then added to the log as a property. This list can then be evaluated.

The following is an example of how the box layout is processed internally for the default console output:

###### Getting the box as a colored string: 
```typescript
private getBoxString(box: Box, colored: boolean | undefined) {
  return box
    .map(segment => {
      // this happens when there is empty space behind a box line
      if (segment === 'empty') { return ' '; } 
      else if (colored) {
        return (
          // this function converts the HEX or RGB string to ANSI-Code 
          getServiceColor(segment.color) +
          BoxLayouts[this._config.boxLayoutStyle!][segment.box] +
          ANSI_CODE.Reset
        );
      } else {
        return BoxLayouts[this._config.boxLayoutStyle!][segment.box];
      }
    })
    .join('');
}
```

The BoxLayouts are a collection of unicode symbols from the [Box Drawing](https://unicode-table.com/en/blocks/box-drawing/). This collection has different types that are also configured via [`options.config.boxLayoutStyle`](https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerConfig.html#boxLayoutStyle). You are free to set own symbols for the personal output streams.