import { BoxLayoutStyleType } from './ColorCode';
import { ErrorLox } from './loxes/ErrorLox';
import { OutputLox } from './loxes/OutputLox';

/** this is the main type of {@link Loxer} */
export interface LoxerType {
  /** ## Initialize Loxer.
   * This is a required function to initialize Loxer.
   *
   * - if Loxer is not initialized, every log is cached until the initialization is done
   * - call this as soon as possible.
   * - **ATTENTION**: Do no conditionally leave out the initialization in order to avoid logging!
   *   All the logs will be cached anyways. If you want to conditionally disable Loxer then use
   *   one of the "disabled" options at the initialization
   *
   * ---
   * @param options Options for the configuration of Loxer
   */
  init: (options: LoxerOptions) => void;
  /** ## Get LogLevel
   * Returns the configured LogLevel (`number`) of the given `moduleIs`s corresponding Module.
   *
   * - is dependent on the environment: returns actual level (prod || dev)
   * - returns `-1` if there is no corresponding module for the given `moduleID`
   *
   * ---
   * @param moduleId the corresponding key of a module from {@link LoxerOptions.modules} declared in `Loxer.init(options)`
   */
  getModuleLevel: (moduleID: string) => LevelType;
  /** ## Highlight a log
   * To highlight any log, just chain this function like that:
   * @example
   * ```typescript
   * Loxer.highlight().log(...)
   * Loxer.highlight().open(...)
   * Loxer.highlight().of(...)
   * ```
   *
   * - by default the `foregroundColor` and `backgroundColor` of the log will be inverted.
   * - a different highlight color can be set at {@link LoxerConfig.highlightColor} in the {@link LoxerOptions.config} declared in `Loxer.init(options)`
   * - the parameter `doit?: boolean` can conditionally highlight the log with `true`
   * - this function can be chained with any other chaining function like `.level(...)` or `.module(...)`
   *
   * ---
   * @param doit should the log be highlighted
   */
  highlight: (doit?: boolean) => this;
  /** ## Highlight a log (shortcut)
   * this is a shortcut for {@link LoxerType.highlight | `Loxer.highlight()`}
   *
   * ---
   * @param doit should the log be highlighted
   */
  h: (doit?: boolean) => this;
  /** ## Set the LogLevel for a log
   * To set the LogLevel for a log, simply chain this function like that:
   *
   * @example
   * ```typescript
   * Loxer.level(number).log(...)
   * Loxer.level(number).open(...)
   * Loxer.level(number).of(...)
   * ```
   *
   * - if you don't chain this function, the default level is `1` (high) for opening logs and the level of the opening
   *   log for any `Loxer.of(...)` log.
   * - levels can be activated for different modules at `options.modules.*level` in the `Loxer.init(options)`
   * - levels on errors (and `Loxer.of(...).error(...)`) will be ignored, but added as an attribute for the output
   * TODO: is this necessary?:
   * - levels on `Loxer.of(...).add(...)` will be changed to the minimum level of the opening log, though the box to
   *   append to might not be logged.
   * - levels on `Loxer.of(...).close(...)` will be strictly changed to the level of the opening log, though otherwise
   *   not opened boxes could be closed, or opened boxes could not be closed.
   * - this function can be chained with any other chaining function like `.highlight(...)` or `.module(...)`
   *
   * ---
   * @param level the level of the log
   */
  level: (level: LogLevelType) => this;
  /** ## Set the LogLevel for a log (shortcut)
   * - this is a shortcut for {@link LoxerType.level | `Loxer.level(number)`}
   * ---
   * @param level the level of the log
   */
  l: (level: LogLevelType) => this;
  /** ## Assign a module to a log
   * To assign a module to a log, simply chain this function like that:
   *
   * @example
   * ```typescript
   * Loxer.module(string).log(...)
   * Loxer.module(string).open(...)
   * Loxer.module(string).of(...)
   * ```
   *
   * - if you don't chain this function the module is always `NONE`, which will lead the log to not have the box layout
   * - if you chain the function without a parameter like `Loxer.module().log(...)` the module will be `DEFAULT`,
   *   which will lead the log to have a box layout but no name
   * - both of the default modules can be overwritten at {@link LoxerOptions.modules} declared in `Loxer.init(options)`
   * - modules can be defined at {@link LoxerOptions.modules} declared in `Loxer.init(options)`
   * - this function can be chained with any other chaining function like `.highlight(...)` or `.level(...)`
   * ---
   * @param moduleId the key of the module from {@link LoxerOptions.modules}. `undefined` defaults to module `"DEFAULT"`
   */
  module(moduleId?: string | undefined): this;
  /** ## Assign a module to a log (shortcut)
   * - this is a shortcut for {@link LoxerType.module | `Loxer.module(string)`}
   * ---
   * @param moduleId the key of the module from {@link LoxerOptions.modules}. `undefined` defaults to module `"DEFAULT"`
   */
  m(moduleId?: string | undefined): this;
  /** ## Simple Log
   * similar to `console.log()`, but:
   * - it is cached until the logger is initialized
   * - it won't proceed any output if Loxer is disabled
   * - the output will be streamed out to the {@link LoxerOptions.callbacks} declared in `Loxer.init(options)`
   * - if no callbacks are given at the initialization, all logs will be logged with `console.log(message, item)`,
   *   but only in development mode
   * - can be chained with `.highlight().log(...)` or `.h().log(...)` to highlight the log
   * - can be chained with `.level().log(...)` or `.l().log(...)` to set a level to the log - otherwise it's `1` (high)
   * - can be chained with `.module().log(...)` or `.m().log(...)` to assign a module to the log - otherwise it's `NONE`
   * - all functions can be chained in combination and different order like: `Loxer.h().l(2).m('Account').log(...)`
   * ---
   * @param message to log
   * @param item to append
   */
  log: (message: string, item?: any) => void;
  /** ## advanced error Log
   * similar to `console.error()`, but:
   * - it is cached until the logger is initialized
   * - it won't proceed any output if Loxer is disabled
   * - the errors will be streamed out to the {@link LoxerOptions.callbacks} declared in `Loxer.init(options)`
   * - if no callbacks are given at the initialization, all errors will be logged with `console.log(error)`,
   *   but only in development mode
   * - the given `Error` will be appended to the output error
   * - if the message is of type `string` | `number` | `boolean` | `object`, then a `new Error(message.toString())`
   *   will be created and appended
   * - all opened logs that were not closed until the error occurred will be appended to the error outputLog
   * - a history of logs will be appended if enabled
   * - can be chained with `.module().error(...)` or `.m().error(...)` to assign a module to the error - otherwise
   *   it's `NONE`
   * - chaining with `.highlight().error(...)` or `.h().error(...)` or `.level().error(...)` or `.l().error(...)` will
   *   not take any effect on the error log (except that `level` and `highlighted` will be attributes of the output)
   * ---
   * @param error an `Error` or `string` | `number`| `boolean` | `object` (converted to an Error)
   * @param item to append
   */
  error: (error: ErrorType, item?: any) => void;
  /** ## Open a boxed Log
   * This function opens a boxed log, that other logs / errors can be assigned to
   * - the log will get a box layout.
   * - it returns an id (`typeof number`) that can be used with `Loxer.of(id)` to assign other logs to it
   * - it is cached until the logger is initialized
   * - it won't proceed any output if Loxer is disabled
   * - the output will be streamed out to the {@link LoxerOptions.callbacks} declared in `Loxer.init(options)`
   * - if no callbacks are given at the initialization, all logs will be logged with `console.log(message, item)`,
   *   but only in development mode
   * - can be chained with `.highlight().open(...)` or `.h().open(...)` to highlight the log
   * - can be chained with `.level().open(...)` or `.l().open(...)` to set a level to the log - otherwise it's `1` (high)
   * - can be chained with `.module().open(...)` or `.m().open(...)` to assign a module to the log - otherwise it's `NONE`
   * - all functions can be chained in combination and different order like: `Loxer.h().l(2).m('Account').open(...)`
   * ---
   * @param message to log
   * @param item to append
   */
  open: (message: string, item?: any) => number;
  /** ## Assign logs / errors to an opened Log
   * This function provides functions to add logs / errors and close the box of the given `id`'s opened log.
   * Usage:
   *
   * @example
   * ```typescript
   * // this has to be done before:
   * const id = Loxer.open('opening message');
   * // assign a log:
   * Loxer.of(id).add('next step is reached');
   * // assign an error:
   * Loxer.of(id).error('something went wrong');
   * // close the log box:
   * Loxer.of(id).close('closing message');
   * ```
   *
   * - assigned logs / errors will receive a time consumption since the box was opened
   * - it won't proceed any output if Loxer is disabled
   * - can be chained with `.highlight().log(...)` or `.h().log(...)` to highlight the log
   * TODO level changes
   * - can be chained with `.level().of(...)` or `.l().of(...)` to set a level to the logs - otherwise it's `1` (high)
   * - chaining with `.module().of(...)` or `.m().of(...)` to assign modules will take no effect though assigned
   *   modules will always adapt the module of the opening log
   * - all functions can be chained in combination and different order like: `Loxer.h().l(2).m('Account').log(...)`
   *
   * ### Returned functions
   * - `add: (message: string, item?: any)` - assigns a single log to the box
   * - `error: (error?: Error | string)` - assigns an error log to the box
   * - `close: (message: string, item?: any)` - assigns a log to the box, that also closes the box (and its box layout)
   * - **ATTENTION**: calling `add()`, `error()` or `close()` after closing the box will not be appended to the box but
   *   logged anyways with a Warning
   * ---
   * @param id the id returned from `Loxer.open()` to reference this log to
   */
  of: (id: number) => OfLoxes;
  /** ## Get the History of all log types
   * This is a list of all logs / boxes / errors that occurred in the past. It must be enabled by initialization.
   * - is a reversed stack, so that the most recent element is at `history[0]`
   * - the size of the history **must be provided** at the {@link LoxerConfig.historyCacheSize} in the
   *   {@link LoxerOptions.config} declared in `Loxer.init(options)` though it **defaults to `0`** for
   *   Performance-reasons
   * - if the history is enabled it will also be appended to the error logs in the `errorOut` callback
   */
  history: (OutputLox | ErrorLox)[];
}

/** this is any possible type that a `catch` could return */
export type ErrorType = Error | string | number | boolean | object;

/** these are the functions returned from the {@link LoxerType.of} method */
export interface OfLoxes {
  /** assigns a single log to a log box and imitates the behavior of {@link Loxer.log} */
  add: (message: string, item?: any) => void;
  /** closes an opened log box and imitates the behavior of {@link Loxer.log} */
  close: (message: string, item?: any) => void;
  /** assigns an error log to a log box and imitates the behavior of {@link Loxer.error} */
  error: (error: ErrorType, item?: any) => void;
}

/** these are the options for the {@link Loxer.init} method */
export interface LoxerOptions {
  /** ## An object containing all loggable modules
   * an exemplary module "Persons" would look like this:
   *
   * @example
   * ```typescript
   *   PERS: { fullname: 'Persons', color: '#0ff', develLevel: 3, prodLevel: 1 }
   * ```
   * - the key `PERS` will be used to reference the module in the logs and is kept short for laziness
   * - the fullname will be (possibly sliced - see {@link LoxerConfig.moduleTextSlice}) displayed as the very first
   *   string at the box layouted output
   * - the color will be applied to the module name and its box layout
   * - the levels are activation boundaries for the specified logs. All logs that have a level higher than the current
   *   module level will therefore not be logged.
   *
   * ## Given Default Modules
   * Some default modules will be set and can be overwritten here:
   *
   * ### The NONE module
   * will be automatically set when there is no `.module(...)` chained on `Loxer.log()`, `Loxer.open()` or `Loxer.of()`
   * when the opening log had no module too. The default is defined as:
   * ```typescript
   *   NONE: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 1 }
   * ```
   * This module will not have a module name or a box layout at the output.
   *
   * ### The DEFAULT module
   * will be automatically set when `Loxer.log()` or `Loxer.open()` logs are chained with an empty `.module()`.
   * The default is defined as:
   * ```typescript
   *   DEFAULT: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 1 }
   * ```
   * This module will have an empty module name, but a box layout at the output.
   *
   * ### The INVALID module
   * will be automatically set when any given module does not exist (as a key) in the given {@link LoxerOptions.modules} in the
   * `Loxer.init(options)`. This module is a visual indicator for misspelled or missing moduleIds. **Additionally this
   * module is serves as a fallback mechanism and should therefore never be overwritten with `undefined`!**
   * The default is defined as:
   * ```typescript
   *   INVALID: { fullname: 'INVALIDMODULE', color: '#f00', develLevel: 1, prodLevel: 0 }
   * ```
   * This module will have a moduleName (`INVALIDMODULE`), but no box layout at the output.
   */
  modules?: LoxerModules;
  /** determines if Loxer is running in a development or production environment.
   * - you can pass any boolean expression here
   * - `process.env.NODE_ENV === 'development'` is common for *NodeJS*
   * - `__DEV__` is common for *react-native*
   * - defaults to `process.env.NODE_ENV === 'development'`
   */
  dev?: boolean;
  /** Functions called as an output stream for Loxer..
   * The output stream is divided into 4 different streams, depending on the environment and the type of log:
   * - `devLog`: logs occuring in development environment
   * - `prodLog`: logs occuring in production environment
   * - `devError`: errors occuring in development environment
   * - `prodError`: errors occuring in production environment
   */
  callbacks?: LoxerCallbacks;
  /** The {@link LoxerConfig Configuration} of Loxer.  */
  config?: LoxerConfig;
}

/** these are the modules for the {@link LoxerOptions} */
export type LoxerModules = { [moduleId: string]: Module };

/** the structure of a loggable module for the {@link LoxerModules} */
export interface Module {
  /** the current level to show logs in development mode */
  develLevel: LevelType;
  /** the current level to show logs in production mode */
  prodLevel: LevelType;
  /** the full name for the logged module */
  fullname: string;
  /** the color used to identify this Log. Supported formats:
   * - hex-string: (eg: `'#ff0000'` or `'#f00'` for red)
   * - rgb-string: (eg: `'rgb(255, 0, 0)'` for red)
   */
  color: string;
}

/** The Level of a Log
 * - 1: high
 * - 2: medium
 * - 3: low
 */
export type LogLevelType = 1 | 2 | 3;

/** The Level of a module that assigned Logs have to be lower than
 * - 0: no output
 * - 1: high
 * - 2: medium
 * - 3: low
 */
export type LevelType = 0 | 1 | 2 | 3;

/** these are the output stream callbacks for the {@link LoxerOptions} */
export interface LoxerCallbacks {
  /** Function called when logging in development mode.
   * This callback receives an {@link OutputLox} which provides several attributes.
   */
  devLog?: (outputLog: OutputLox) => void;
  /** Function called when logging in production mode.
   * This callback receives an {@link OutputLox} which provides several attributes.
   */
  prodLog?: (outputLog: OutputLox) => void;
  /** Function called when errors are recorded in production mode.
   * This callback provides an {@link ErrorLox} which provides the attributes of an `OutputLox` plus some error
   * specific ones.
   */
  prodError?: (errorLog: ErrorLox) => void;
  /** Function called when errors are recorded in development mode.
   * This callback provides an {@link ErrorLox} which provides the attributes of an `OutputLox` plus some error
   * specific ones.
   */
  devError?: (errorLog: ErrorLox) => void;
}

/** This is the configuration for the {@link LoxerOptions} */
export interface LoxerConfig {
  /** the length where the modules' names will be sliced in order to fit the layout.
   * - defaults to `8`
   */
  moduleTextSlice?: number;
  /** the opacity of the moduleText (`options.modules[...].fullname`) that appears on the `Loxer.of(...).close()` log
   * - number between `[0,1]`
   * - defaults to `0` which means "hidden"
   */
  endTitleOpacity?: number;
  /** the style of the Box-layout
   * - possible values are "round" | "light" | "heavy" | "double" | "off"
   * - of does not print any Layout but saves the insets, that the box layout would need
   * - defaults to `'round'`
   */
  boxLayoutStyle?: BoxLayoutStyleType;
  /** disables Loxer in production mode.
   * - if Loxer is initialized with `options.config.disabledInProductionMode: true` then - in production environment - the
   *   cache is erased and upcoming logs will not be cached anymore
   * - in fact all logging function then immediately return "nothing" for performance reasons
   * - defaults to `false`
   */
  disabledInProductionMode?: boolean;
  /** disables Loxer completely.
   * - this **MUST** be used in order to suppress logging without deleting the Loxer calls!
   * - without disabling AND init() of Loxer, all the logs will be cached "infinitely", because
   *   they "wait" for the init().
   * - if Loxer is initialized with `options.config.disabled: true` then the cache is erased and upcoming logs will not be
   *   cached anymore
   * - in fact all logging function then immediately return "nothing" for performance reasons
   * - defaults to `false`
   */
  disabled?: boolean;
  /** the backgroundColor used for highlighting logs. Supported formats:
   * - hex-string: (eg: `'#ff0000'` or `'#f00'` for red)
   * - rgb-string: (eg: `'rgb(255, 0, 0)'` for red)
   * - defaults to "inverted" colors
   */
  highlightColor?: string;
  /** disables all colors for the output.
   * - use this if the console can't handle `\x1b[38;2;R;G;Bm` colors.
   * - this only takes effect, if the Callbacks are unset and the console.log is used internally.
   * - the Callbacks receive colored and uncolored messages seperately
   * - defaults to `false`
   */
  disableColors?: boolean;
  /** determines how many output- / error logs shall be cached in the history.
   * - is accessable with `Loxer.history`
   * - will be additionally appended to error outputs
   * - **defaults to `0`**
   */
  historyCacheSize?: number;
}
