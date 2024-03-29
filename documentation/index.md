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

Instructions on how to use the Item can be found **[on the Item documentation][itemDocs]**.


# Overview
Loxer's main goal is to increase the safety of applications by showing the developer the data flow of the application with the help of logs. For this, it is possible for him to provide logs with levels, to categorize them in modules, to expand error messages with additional information and to connect logs with one another. A box is created for this, which begins with an opening log, is continued with any number of logs and errors and ends with a closing log. This is then visualized with a kind of branching system. Loxer also serves as a middleware logger by allowing the user to determine the output streams himself using callbacks. In this way, it can be achieved, for example, that the behavior of an application in the production environment is recorded and, in the event of an error, detailed information about the cause is forwarded to an analysis service such as firebase crashlytics.

The following sections describe the use of Loxer in detail. Further information can be found in the [API Reference][api].

# 1. Initialization - [`Loxer.init()`][loxer.init]
In order to be able to use Loxer, it must first be initialized. To do this, the method `Loxer.init(options?: LoxerOptions)` must be called once. Loxer can be configured with [`LoxerOptions`][loxerOptions] during initialization. For the simple initialization, the options can also be left out.

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
  // An object containing all log-able modules
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
    devLevel: LevelType;
    // the actual level to show logs in production mode
    prodLevel: LevelType;
  };
```

More about the details of the options can be found in the following sections.

<!-- ------------------------------------------------------------------------------------------- -->


# 2. Simple logs - [`Loxer.log()`][loxer.log]
To make a simple log, all you have to do is call `Loxer.log(message: string, item?: ItemType, itemOptions?: ItemOptions)`. In the default - unless otherwise specified in `Loxer.init(options.callbacks)` - `message` and `item` are logged with `console.log(message + ITEM)`, where `ITEM` is a prettified and configurable printed version of the item (any variable). All you have to do is replacing `console` with `Loxer`.


###### Example
```typescript
const person = {name: "John Doe", age: 69};
console.log('This is the person:', person);
Loxer.log('This is the person:', person);
```

###### Console output
<!-- ![console_output](/assets/docs_images/2.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/2.png)

On page **[Item][itemDocs]** there is a detailed guide about the advantages over the `console` and the possibilities that the `item` brings with it.

> Loxer comes with some improvements for logs:
> - Logs can be highlighted.
> - Logs can be given levels.
> - Logs can be categorized in modules.
> - Logs can be distributed to different output streams.
> - More on that in the sections about boxes and output.

<!-- ------------------------------------------------------------------------------------------- -->


# 3. Error logs - [`Loxer.error()`][loxer.error]
Creating simple error logs is analogous to a simple log. Therefore you write `Loxer.error(error: ErrorType, item?: ItemType, itemOptions?: ItemOptions)`. By default this log will be proceeded to `console.error()`.

The error parameter must be of `type ErrorType = Error | string | number | boolean | object`, because these are the types that an error of a `catch(error)` phrase can take. The `item?: any` behaves the same way like in the `.log()` method.

###### Example
```typescript
Loxer.error('this is a string error');
Loxer.error(404);
Loxer.error(false);
Loxer.error({ type: 'ServerError', code: 404 });
Loxer.error(new RangeError('this is a range error'));

// if using .highlight() or .h() on an error, then the stack ALWAYS will be printed:
Loxer.highlight().error('this is a highlighted error that prints the stack!!!');
```


###### Console output
<!-- ![console_output](/assets/docs_images/3.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/3.png)

Loxer internally creates an `Error` out of any other message type than `Error` though it enables to get a Stack even if the thrown error has none.

### [NamedError][namedError]
There is also helper class called `NamedError`. It can be used to create custom errors which can extend any other error. This may be useful for more explicit results of the error in a catch phrase.

###### Example
```typescript
Loxer.error(new NamedError('CustomError', 'failed hard!'));
Loxer.error(new NamedError('StringError', 'failed hard!', 'string error'));
Loxer.error(new NamedError('NumberError', 'failed hard!', 404));
Loxer.error(new NamedError('BooleanError', 'failed hard!', false));
Loxer.error(new NamedError('ObjectError', 'failed hard!', { type: 'ServerError', code: 404 }));
Loxer.error(new NamedError('ErrorError', 'failed hard!', new TypeError('catched Error')));
```


###### Console output
<!-- ![console_output](/assets/docs_images/3-2.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/3-2.png)

There is also a shortcut for the creation of `NamedError`s in combination with `Loxer.of(...).error(...)`, which combines the parameters of the `NamedError` followed by the parameters of the `.error(...)` method:
```typescript
Loxer.of(...).namedError(
    name: string,
    message: string,
    existingError?: unknown,
    item?: ItemType,
    itemOptions?: ItemOptions
  );

// Example:
Loxer.of(lox).namedError('MyError', 'crashed', someGivenError, someItem);
// is equivalent to:
Loxer.of(lox).error(new NamedError('MyError', 'crashed', someGivenError), someItem) ;
```

> More on that in the sections about boxes and output.

<!-- ------------------------------------------------------------------------------------------- -->


# 4. Highlighting - [`Loxer.highlight()`][loxer.highlight]
Highlighting logs has the advantage of being able to view a certain log relatively quickly from a large number of logs. To highlight a log, it just needs to be chained with `.highlight()` or `.h()`, with the last one being a shortcut. The output message will then have inverted background and text colors by default. This can be configured in the [LoxerConfig][loxerConfig] which is part of the `Loxer.init(...)`

###### Example
```typescript
Loxer.highlight().log('this will be seen easily');
Loxer.h().log('this too');

// conditionally highlight
const shouldHighlight = Math.random() > 0.5;
// the methods accept an optional boolean parameter
Loxer.h(shouldHighlight).log('This message will be conditionally highlighted');
```

###### Console output
<!-- ![console_output](/assets/docs_images/4.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/4.png)

> - The highlight methods can be chained with **any other logging** method like `Loxer.error()`, `Loxer.open()` and `Loxer.of()`.
> - highlighting error logs will append the stack to the output stream
> - They can also be chained with **any other chaining method** like `.level()` and `module()` in **any order**.
> - The highlighting will only take effect on the `colored.message` property on the output streams logs / errors.

<!-- ------------------------------------------------------------------------------------------- -->


# 5. Levels - [`Loxer.level()`][loxer.level]
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

> You can also add levels to the logging methods `Loxer.open()` and `Loxer.of().add()`. `Loxer.of().close()` will always receive the level of it's opening log to prevent leaving boxes unclosed. Giving `Loxer.error()` a level is no problem, but has no effect on whether it is logged. It always will.

### Default levels (and module levels)
Providing logs with levels would make no sense if you couldn't set which level the logger should display / log. Therefore you have to declare the levels as part of the [`LoxerConfig`][loxerConfig] when you initialize `Loxer`.


###### Example
```typescript
Loxer.init({
  defaultLevels: {
    devLevel: 3,  // the level in development environment
    prodLevel: 1,   // the level in production environment
  }
});
```
      
Possible levels for Loxer and modules are `export type LevelType = 0 | 1 | 2 | 3;`, where 1, 2 and 3 like `LogLevelType` and 0 = no output.

The default levels for logs are `1` (high) for development environment and `0` (off) for production environment. These will be used if any logging method is used without assigning a module.

If you declare modules then you can set separate levels for every module, giving you the opportunity to separate their logging density from each other.

> Setting the `prodLevel` to `0` (off) is an easy way of disabling logs in the production environment, though even without declared outputStreams the `console` will never be used.

<!-- ------------------------------------------------------------------------------------------- -->


# 6. Modules - [`Loxer.module()`][loxer.module]
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
Loxer.m('CART').log('this one is assigned to a module with the fullName "Shopping Cart"');
Loxer.m('BILLING').log('this one to "Billing"');
Loxer.m().log('this one is automatically assigned to the module DEFAULT');
Loxer.log('this one is automatically assigned to the module NONE');
```

###### Console output
<!-- ![console_output](/assets/docs_images/6.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/6.png)

> The module methods can be chained with the logging methods `Loxer.error()` and `Loxer.open()`. Assigning a module to `Loxer.of()` is no problem, but has no effect. `.of()` logs always receive the module from their opening log.

### Declaring modules
Modules must be declared as part of the [`LoxerOptions`][loxerOptions] when you initialize `Loxer`. Therefore the `options.modules` must receive an object of `type LoxerModules = { [moduleId: string]: Module }`, where the `moduleId` is the key that will be referenced in the `.m()` and `.module()` methods.

A [`Module`][loxerModule] must be structured as :
```typescript
{ 
  devLevel: LevelType; 
  prodLevel: LevelType; 
  fullName: string; 
  color: string; 
  boxLayoutStyle?: BoxLayoutStyle; 
}
```
The two levels are of the same type as the `defaultLevels` and the `fullName`, `color` and `boxLayoutStyle` will be used for the output.

The `color` must be either structured in HEX (`'#ff1258'`) or RGB format (`'rgb(255, 0, 0)'`) that will be interpreted by the [color][pkg.color] package.

###### Declaring modules
```typescript
Loxer.init({
  modules: {
    PERS: { color: '#f00', fullName: 'Persons', devLevel: 1, prodLevel: 1 },
    CART: { color: '#00ff00', fullName: 'Shopping cart', devLevel: 1, prodLevel: 1 },
    BILLING: { color: 'rgb(0, 120, 255)', fullName: 'Billing', devLevel: 1, prodLevel: 1 }
  }
});
```

> - You are free to set any string key for a `moduleId`, but it will be efficient to choose short ones, because you probably have to write them often.

### Default modules
###### There are 3 default modules, that are predefined:
```typescript
export const DEFAULT_MODULES: LoxerModules = {
  NONE: { fullName: '', color: '#fff', devLevel: 1, prodLevel: 0 },
  DEFAULT: { fullName: '', color: '#fff', devLevel: 1, prodLevel: 0 },
  INVALID: { fullName: 'INVALIDMODULE', color: '#f00', devLevel: 1, prodLevel: 0 }
};
```

The `NONE` module is automatically assigned when there is no module method chained in a logging method. The output will have no box layout and no module name as prefix.

The `DEFAULT` module is automatically assigned, when logs are chained with an empty module method like `.m()`. The output will have a box layout and an empty module name.

The `INVALID` module is automatically assigned, when logs are tried to be assigned with non existing modules (giving false moduleIds). The output will have no boxlayout, but the prominent fullName as module name.

###### Example
```typescript
Loxer.log('this log is automatically assigned to the module NONE');
Loxer.m().log('this one to the module DEFAULT');
Loxer.m('Wrong').log('this one to the INVALID module');
```
###### Console output
<!-- ![console_output](/assets/docs_images/6-2.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/6-2.png)

> All default modules can be redefined in the `options.modules` by overwriting their keys.
> - **ATTENTION**: beware of forcefully setting any of these modules to a falsy value like `null` or `undefined` because this will definitely cause Loxer to crash.
> - If you want to disable them, set their levels to `0`. 

<!-- ------------------------------------------------------------------------------------------- -->


# 7. Output - [`LoxerCallbacks`][loxerCallbacks]
Loxer isn't just an extension for the console. It is an independent logger that in the default case uses the console as an output medium in the development environment. There are 4 different output streams available, which can be specified as `callbacks: LoxerCallbacks` in the `Loxer.init(options)`.

The `type LoxerCallbacks` has the following structure:
```typescript
{
  /** Function called when logging in development mode. */
  devLog?: (outputLog: OutputLox) => void;
  /** Function called when logging in production mode. */
  prodLog?: (outputLog: OutputLox) => void;
  /** Function called when errors are recorded in production mode. */
  prodError?: (errorLog: ErrorLox, history: (OutputLox | ErrorLox)[]) => void;
  /** Function called when errors are recorded in development mode. */
  devError?: (errorLog: ErrorLox, history: (OutputLox | ErrorLox)[]) => void;
}
```

Whenever a log with its level fulfills the requirements of the default levels or its module level, it is forwarded (depending on the environment) to the `devLog` or` prodLog` output stream. Error logs are always forwarded to the corresponding output stream (`devError` or `prodError`). You can tell Loxer the environment as `options.dev: boolean` in the `Loxer.init(options)`. In the default case it is `dev = process.env.NODE_ENV === 'development'`.

The `devLog` and `devError` callbacks default to printing the colored logs to the console. `prodLog` and `prodError` default to log nothing in order to keep the application clean in production environment. This is expressed in the fact that the production streams only interact with the user-specific ones and have no defaults.

In order to occupy a stream itself, the corresponding output log is passed to the callback.

###### Example Declaration
```typescript
Loxer.init({
  callbacks: {
    devLog: (outputLog) => {
      // ... do something with the OutputLox
    }
  }
})
```

### Output logs
To symbolize that the logs are more than just simple messages, they are named `* Lox`. There are two different types. In addition to the original message and item parameters, the [`OutputLox`][outputLox] contains the declared properties level, highlight and module, a time stamp and properties that arise from the box layout. [`ErrorLox`][errorLox] have the same properties, but also carry information such as the `Error` that has occurred and properties that represent the log status during the occurrence of the error.

###### [OutputLox][outputLox]
```typescript
{
  /** the internal identifier of the log */
  id: number;
  /** the message of the log */
  message: string;
  /** determines if the log was highlighted with `Loxer.highlight()` or `Loxer.h()` */
  highlighted: boolean;
  /** an optional item */
  item: any | undefined;
  /** options to configure the (default) output of the item */
  itemOptions: ItemOptions | undefined;
  /** the type of the log */
  type: LoxType;
  /** the corresponding key of a module from `LoxerOptions.modules` */
  moduleId: string;
  /** the log level that was given with `Loxer.level(number)` or `Loxer.l(number)` */
  level: LevelType;
  /** the time the log appeared */
  timestamp: Date;
  /** the box layout of the log */
  box: Box = [];
  /** a string that represents the time consumption from the opening log's `timestamp` until this log appeared */
  timeText: string | '' = '';
  /** the time consumption (in `ms`) from the opening log's `timestamp` until this log appeared */
  timeConsumption: number | undefined;
  /** determines if the log has not fulfilled the level that the corresponding module has set */
  hidden: boolean = false;
  /** the corresponding module of this Lox (for module text / color / etc.) */
  module: ExtendedModule = DEFAULT_EXTENDED_MODULE;
}
```

###### [ErrorLox][errorLox]
```typescript
  // ... all the Properties from OutputLox +
  /** the error that was initially given, or created by Loxer */
  error: Error;
  /** a list of opened `OutputLox` which have not been closed until the occurrence of this error log */
  openLoxes: OutputLox[] = [];
```

> For more detailed information about the Lox's properties (as well as all other components of Loxer), a look at the [API reference][logs] is recommended.

### Callbacks
Now that we know how the output streams work and what the transferred `*Lox` look like, it is a good idea to take a look at how the `dev*` streams are used internally.

###### devLog internally
```typescript
private devLogOut(outputLox: OutputLox) {
  if (this._callbacks?.devLog) {
    this._callbacks.devLog(outputLox);
  } else {
    // colorize the output if wanted
    const opacity = outputLox.type === 'close' ? this._endTitleOpacity : 1;
    const colored = ANSIFormat.colorLox(outputLox, opacity, this._highlightColor);
    const message = this._colorsDisabled ? outputLox.message : colored.message;
    const moduleText = this._colorsDisabled ? outputLox.module.slicedName : colored.moduleText;
    const timeText = this._colorsDisabled ? outputLox.timeText : colored.timeText;
    // generate the box layout
    const box = BoxFactory.getBoxString(outputLox.box, !this._colorsDisabled);
    // construct the message
    const str = `${moduleText}${box}${message}\t${timeText}`;
    // prettify the item
    if (outputLox.item) {
      console.log(
        str +
          Item.of(outputLox).prettify(true, {
            depth: outputLox.module.slicedName.length + outputLox.box.length,
            color: outputLox.module.color,
          })
      );
    } else {
      console.log(str);
    }
  }
}
```

As you can see here, the `OutputLox` is forwarded unchanged to the `devLog` stream. The `else` branch (the default) shows how the `OutputLox` can be processed. 
- The helper class [`ANSIFormat`][ansiFormat] offers some static methods for the coloring of the output unsing the `[x1b` ANSI code. 
- The helper class [`BoxFactory`][boxFactory] offers a method `.getBoxString(...)` which generates the known box layout, that is used by default. 
- The helper class [`Item`][item] offers a method chain `.of(Lox).prettify(OPTIONS)` which lets you refine the inherited `lox.item` to be printed in a similar way as the `console` does with its secondary parameters. For more information on that see page **[Item][itemDocs]**

The `ErrorLox` can be used in the same way:

###### devError internally
```typescript
private devErrorOut(errorLox: ErrorLox, history: LoxHistory) {
    if (this._callbacks?.devError) {
      this._callbacks.devError(errorLox, history.stack);
    } else {
      // colorize the output if wanted
      const colored = ANSIFormat.colorLox(errorLox);
      const message = this._colorsDisabled ? errorLox.message : colored.message;
      const moduleText = this._colorsDisabled ? errorLox.module.slicedName : colored.moduleText;
      const timeText = this._colorsDisabled ? errorLox.timeText : colored.timeText;
      // generate the box layout
      const box = BoxFactory.getBoxString(errorLox.box, !this._colorsDisabled);
      // construct the log message
      const msg = moduleText + box + message + timeText;
      const stack = errorLox.highlighted && errorLox.error.stack ? errorLox.error.stack : '';
      const openLogs =
        errorLox.highlighted && errorLox.openLoxes.length > 0
          ? `\nOPEN_LOGS: [${errorLox.openLoxes
              .map((outputLox) => outputLox.message)
              .join(' <> ')}]`
          : '';
      const str = msg + stack + openLogs;
      // prettify the item if present
      if (errorLox.item) {
        console.log(
          str +
            Item.of(errorLox).prettify(true, {
              depth: errorLox.module.slicedName.length + errorLox.box.length,
              color: errorLox.module.color,
            })
        );
      } else {
        console.log(str);
      }
    }
}
```

The `prod*` streams are both just forwarded to the user callbacks. These can be used to interact with other 3rd party services like [Firebase Crashlytics][pkg.crashlytics].


# 8. Boxes
Another main feature of Loxer is the ability to visualize data flows. To do this, logs are combined into boxes by defining a start and an end log. Further logs as well as errors can be added between the two. In addition, the elapsed time since the opening log is measured for each log / error.

In addition, a box layout is created that shows the course of the box, but with the degree of nesting in relation to other boxes or individual logs. This enables connections between synchronous and asynchronous processes to be recognized and potential sources of error to be tracked down. Furthermore, it can easily be determined whether processes are not terminating, are taking too long, are too short, or are not being carried out at all.

### Create boxes

To use a box, it must be opened with `Loxer.open(message: string, item?: ItemType, itemOptions?: ItemOptions)`. The `.open()` method returns the `id: number` of the log, which is used to connect other logs to this one. The rest of the structure and functionality is analogous to the `.log()` method. It can also be chained with `.highlight()`, `.level()` and `.module()`, just like the rest of the log methods. **As a reminder**, if the box layout is to be generated, **a module** or at least the default module (`.m()`) **must be assigned** to the log that opens.

###### Open a box - [`Loxer.open()`][loxer.open]
```typescript
const id = Loxer.module().open('this is an opening message');
const id2 = Loxer.module('PERS').open('this is an opening message assigned to a module');
const id3 = Loxer.h().m('CART').open('this one is additionally highlighted');
```

###### Console output
<!-- ![console_output](/assets/docs_images/8-1.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/8-1.png)

If an open box is to be closed, or logs / errors are to be added, the `Loxer.of(id: number)` method must be used. This method returns an object with [3 further methods][ofLoxes], which enables the next method to be added as a chain. These are the actual logging methods:
- `add(message: string, item?: ItemType, itemOptions?: ItemOptions)` - adds a log to the box and works in the same way as `Loxer.log()`
- `error(error: ErrorType, item?: ItemType, itemOptions?: ItemOptions)` - adds an error to the box and works in the same way as `Loxer.error()`
- `close(message: string, item?: ItemType, itemOptions?: ItemOptions)` - closes the box and works in the same way as `Loxer.log()`

**ATTENTION**: When calling `add()`, `error()` or `close()` after closing the box, the log will not be appended to the box but logged anyways with a Warning!

###### Assigning / closing a box - [`Loxer.of()`][loxer.of]:
```typescript
const lox = Loxer.m('BILLING').open('This is the opening log');
Loxer.of(lox).add('this is a single added log');
Loxer.of(lox).error('this is an added error');
Loxer.of(lox).close('this is the closing log');
Loxer.of(lox).add('this log is shown but as error');
```

###### Console output
<!-- ![console_output](/assets/docs_images/8-2.png) -->
![console_output](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/8-2.png)

> - When using `Loxer.of()`, `.level()` and `.module()` do not necessarily have to be specified again, since `.of()` automatically uses the values of the opening log as default.
> - Otherwise, `.level()` can be chained **before** the `.of`.
> - It is not possible to specify a different `.module()`, since **always** the module of the opening log is used!

### The Box Layout
The box layout which is output to the console by default consists of unicode box drawing characters. For this purpose, during the processing of the log, it is determined which row of box symbols belongs to a log. In addition, the box symbols are assigned the colors of the respective modules. The resulting list is then added to the log as a property. This list can then be evaluated.

The default BoxLayout used for the default output streams can be configured in the [LoxerConfig][loxerConfig] with the property [BoxLayoutStyle][boxLayoutStyle]. Other than that, every [LoxerModule][loxerModule] that is defined at the initialization can take a separate `boxLayoutStyle`.

The following is an example of how the box layout is processed internally for the default console output:

###### Getting the box as a colored string: 
```typescript
static getBoxString(box: Box, colored: boolean | undefined): string {
  const result = box
    .map((segment) => {
      if (segment === 'empty') {
        return ' ';
      }
      if (colored) {
        return ANSIFormat.colorize(BoxLayouts[segment.boxLayout][segment.box], segment.color);
      }
      return BoxLayouts[segment.boxLayout][segment.box];
    })
    .join('');
  return result.length > 0 ? `${result} ` : result;
}
```

The `BoxLayouts` are a collection of Unicode symbols from the [Box Drawing][pkg.boxDrawing] table. This collection has different types that are also configured via [`options.config.boxLayoutStyle`][boxLayoutStyle]. 

You are free to set own symbols for the personal output streams. In this case, a box layout must implement the following interface:

###### BoxSymbols
```typescript
export interface BoxSymbols {
  /** the litte (left) arrow at the end of the opening box */
  openEnd: string;
  /** the edge that goes from right to bottom */
  openEdge: string;
  /** a vertical dash `|` used for deeper branches in other box rows */
  vertical: string;
  /** a horizontal dash used for closing lines over empty background AND as the end of single logs / errors */
  horizontal: string;
  /** a rotated T, used to branch single logs / errors from the main stream */
  single: string;
  /** the symbol for overlapping branches */
  cross: string;
  /** the edge that goes from top to right */
  closeEdge: string;
  /** the litte (right) arrow at the end of a closing log */
  closeEnd: string;
}
```

Then you can use it to reference the symbols from your own BoxLayout:

###### Example
```typescript
const myLayout: BoxSymbols = {
  openEnd: '<',
  openEdge: '/',
  vertical: '|',
  horizontal: '-',
  single: '}',
  cross: '+',
  closeEdge: '\\',
  closeEnd: '>',
};

const myBoxString = outputLox.box
  .map(segment => (segment === 'empty' ? ' ' : myLayout[segment.box]))
  .join('');
```

<!------------------------------------------ REFERENCES ------------------------------------------>

[itemDocs]: https://github.com/pcprinz/loxer/blob/master/documentation/item.md
[api]: https://pcprinz.github.io/loxer/index.html
[pkg.color]: https://www.npmjs.com/package/color
[pkg.crashlytics]: https://firebase.google.com/docs/crashlytics/
[pkg.boxDrawing]: https://unicode-table.com/en/blocks/box-drawing/

[namedError]: https://pcprinz.github.io/loxer/classes/Error.NamedError.html
[outputLox]: https://pcprinz.github.io/loxer/classes/Logs.OutputLox.html
[errorLox]: https://pcprinz.github.io/loxer/classes/Logs.ErrorLox.html
[logs]: https://pcprinz.github.io/loxer/modules/Logs.html
[boxLayoutStyle]: https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerConfig.html#boxLayoutStyle
[boxFactory]: https://pcprinz.github.io/loxer/classes/Formatting.BoxFactory.html
[ansiFormat]: https://pcprinz.github.io/loxer/classes/Formatting.ANSIFormat.html
[item]: https://pcprinz.github.io/loxer/classes/Formatting.Item.html

[loxerOptions]: https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerOptions.html
[loxerConfig]: https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerConfig.html
[loxerModule]: https://pcprinz.github.io/loxer/interfaces/Loxer.Module.html
[loxerCallbacks]: https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerCallbacks.html

[loxer.init]: https://pcprinz.github.io/loxer/interfaces/Loxer.LoxerCore.html#init
[loxer.log]: https://pcprinz.github.io/loxer/interfaces/Loxer.LogMethods.html#log
[loxer.error]: https://pcprinz.github.io/loxer/interfaces/Loxer.LogMethods.html#error
[loxer.open]: https://pcprinz.github.io/loxer/interfaces/Loxer.LogMethods.html#open
[loxer.of]: https://pcprinz.github.io/loxer/interfaces/Loxer.LogMethods.html#of
[ofLoxes]: https://pcprinz.github.io/loxer/interfaces/Loxer.OfLoxes.html

[loxer.highlight]: https://pcprinz.github.io/loxer/interfaces/Loxer.Modifiers.html#highlight
[loxer.level]: https://pcprinz.github.io/loxer/interfaces/Loxer.Modifiers.html#level
[loxer.module]: https://pcprinz.github.io/loxer/interfaces/Loxer.Modifiers.html#module
