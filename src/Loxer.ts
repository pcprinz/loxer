import { BoxFactory } from './core/BoxFactory';
import { ensureError, LoxerError } from './core/Error';
import { ItemType, ItemOptions } from './core/Item';
import { Loxes } from './core/Loxes';
import { LoxHistory } from './core/LoxHistory';
import { Modules } from './core/Modules';
import { OutputStreams } from './core/OutputStreams';
import { is, isNES } from './Helpers';
import { ErrorLox } from './loxes/ErrorLox';
import { Lox, LoxType } from './loxes/Lox';
import { OutputLox } from './loxes/OutputLox';
import { ErrorType, LogLevelType, Loxer as LoxerType, LoxerOptions, OfLoxes } from './types';

/**
 * This is the main class of Loxer. It works "static" because it's a singleton instance though you
 * don't need to call ~`new Loxer()`~. Instead you use it with **`Loxer.log()`** (or any other method).
 *
 * ### For an overview of all methods and a guide on how to use it, take a look at the [Documentation](https://github.com/pcprinz/loxer/blob/master/documentation/index.md).
 */
class LoxerInstance implements LoxerType {
  private _loxes = new Loxes();
  private _history = new LoxHistory();
  private _modules: Modules = new Modules();
  private _boxFactory: BoxFactory = new BoxFactory();
  private _output: OutputStreams = new OutputStreams();

  private _initialized: boolean = false;
  private _dev: boolean = false;
  private _disabled: boolean = false;

  init(props?: LoxerOptions) {
    this._initialized = true;
    if (is(props) && is(props?.dev)) {
      this._dev = props.dev;
    } else {
      this._dev = isNES(process.env.NODE_ENV) ? 'development' === process.env.NODE_ENV : false;
    }
    // configuration
    const config = props?.config;
    if (config?.disabled) {
      this._disabled = true;
    } else {
      this._disabled = config?.disabledInProductionMode ? !this._dev : false;
    }
    this._modules = new Modules({
      dev: this._dev,
      modules: props?.modules,
      moduleTextSlice: config?.moduleTextSlice ?? 8,
      defaultLevels: props?.defaultLevels,
    });
    this._history = new LoxHistory(config?.historyCacheSize);
    this._boxFactory = new BoxFactory(config?.defaultBoxLayoutStyle);
    this._output = new OutputStreams({
      callbacks: props?.callbacks,
      disableColors: config?.disableColors,
      boxFactory: this._boxFactory,
      endTitleOpacity: config?.endTitleOpacity,
      highlightColor: config?.highlightColor,
      moduleTextSlice: config?.moduleTextSlice ?? 8,
    });

    this.highlight().log('Loxer initialized');
    this._loxes.dequeue().forEach((queued) => this.switchOutput(queued.lox, queued.error));
  }

  get history() {
    return this._history.stack;
  }

  getModuleLevel(moduleId: string) {
    return this._modules.getLevel(moduleId);
  }

  private resetState() {
    this._highlighted = false;
    this._level = undefined;
    this._moduleId = 'NONE';
  }

  // highlight ##############################################################

  private _highlighted: boolean = false;
  highlight(doit: boolean = true) {
    return this.h(doit);
  }
  h(doit: boolean = true) {
    this._highlighted = doit;

    return this;
  }

  // level ##################################################################

  private _level: LogLevelType | undefined;
  level(level: LogLevelType) {
    return this.l(level);
  }
  l(level: LogLevelType) {
    this._level = level;

    return this;
  }

  // moduleId ###############################################################

  private _moduleId: string = 'NONE';
  module(moduleId?: string) {
    return this.m(moduleId);
  }
  m(moduleId?: string) {
    this._moduleId = isNES(moduleId) ? moduleId : 'DEFAULT';
    // catch wrong module ids
    this._moduleId = this._modules.ensureModule(this._moduleId);

    return this;
  }

  // log functions ##########################################################

  log(message: string = '', item?: ItemType, itemOptions?: ItemOptions) {
    if (this._disabled) {
      return;
    }
    this.switchOutput(
      new Lox({
        id: undefined,
        highlighted: this._highlighted,
        item,
        itemOptions,
        level: this._level ?? 1,
        message,
        moduleId: this._moduleId,
        type: 'single',
      })
    );
  }

  error(error: ErrorType, item?: ItemType, itemOptions?: ItemOptions) {
    this.internalError(error, undefined, undefined, undefined, item, itemOptions);
  }

  private internalError(
    error: ErrorType,
    logId: number | undefined,
    moduleId: string = this._moduleId,
    messagePrefix: string = '',
    item?: ItemType,
    itemOptions?: ItemOptions
  ) {
    const sureError = ensureError(error);
    this.switchOutput(
      new Lox({
        id: logId,
        highlighted: this._highlighted,
        item,
        itemOptions,
        level: this._level ?? 1,
        message: messagePrefix + sureError.message,
        moduleId,
        type: 'error',
      }),
      sureError
    );
  }

  open(message: string, item?: ItemType, itemOptions?: ItemOptions) {
    if (this._disabled) {
      return 0;
    }
    const lox = new Lox({
      id: undefined,
      highlighted: this._highlighted,
      item,
      itemOptions,
      level: this._level ?? 1,
      message,
      moduleId: this._moduleId !== 'NONE' ? this._moduleId : 'DEFAULT',
      type: 'open',
    });
    this.switchOutput(lox);

    return lox.id;
  }

  of(id: number): OfLoxes {
    if (this._disabled) {
      return {
        add: () => {
          /* do nothing */
        },
        close: () => {
          /* do nothing */
        },
        error: () => {
          /* do nothing */
        },
      };
    }
    const openLox = this._loxes.findOpenLox(id);
    if (!is(openLox)) {
      return {
        add: (message: string, item?: ItemType, itemOptions?: ItemOptions) => {
          this.internalError(
            new LoxerError(message),
            id,
            undefined,
            'add() on a not (anymore) existing Lox. MESSAGE: ',
            item,
            itemOptions
          );
        },
        close: (message: string, item?: ItemType, itemOptions?: ItemOptions) => {
          this.internalError(
            new LoxerError(message),
            id,
            undefined,
            'close() on a not (anymore) existing Lox. MESSAGE: ',
            item,
            itemOptions
          );
        },
        error: (error: ErrorType, item?: ItemType, itemOptions?: ItemOptions) => {
          this.internalError(
            error,
            id,
            undefined,
            'error() on a not (anymore) existing Lox. ERROR: ',
            item,
            itemOptions
          );
        },
      };
    }

    return {
      add: (message: string, item?: ItemType, itemOptions?: ItemOptions) => {
        this.appendLox('single', openLox, message, item, itemOptions);
      },
      close: (message: string, item?: ItemType, itemOptions?: ItemOptions) => {
        this.appendLox('close', openLox, message, item, itemOptions);
      },
      error: (error: ErrorType, item?: ItemType, itemOptions?: ItemOptions) => {
        this.internalError(error, openLox.id, openLox.moduleId, undefined, item, itemOptions);
      },
    };
  }

  private appendLox(
    type: LoxType,
    openLox: Lox,
    message: string,
    item?: ItemType,
    itemOptions?: ItemOptions
  ) {
    const { id, moduleId, level: oLevel } = openLox;
    // close level must be open level + added logs must not have a lower level, though the open box could possibly not exist
    const level =
      type === 'single' ? (Math.max(oLevel, this._level ?? oLevel) as LogLevelType) : oLevel;
    this.switchOutput(
      new Lox({
        id,
        highlighted: this._highlighted,
        item,
        itemOptions,
        level,
        message,
        moduleId,
        type,
      })
    );
  }

  // output #################################################################

  private switchOutput(lox: Lox, error?: Error) {
    this.resetState();

    // TODO should errors really be hold back until init?
    if (!this._initialized) {
      this._loxes.enqueue(lox, error);
    } else if (lox.type === 'error') {
      const errorLox = this.toErrorLox(lox, error!);
      this._history.add(errorLox);
      this._output.errorOut(this._dev, errorLox, this._history);
    } else {
      const outputLox = this.toOutputLox(lox);
      if (!outputLox.hidden) {
        this._history.add(outputLox);
        this._output.logOut(this._dev, outputLox);
      }
      this._loxes.proceed(outputLox);
    }
  }

  private toErrorLox(lox: Lox, error: Error): ErrorLox {
    const errorLox = new ErrorLox(lox, error);
    errorLox.setTime(this.getTimeConsumption(errorLox));
    errorLox.color = this._modules.getColor(errorLox.moduleId);
    errorLox.moduleText = this._modules.getText(errorLox);
    errorLox.box = this._boxFactory.getLogBox(errorLox, this._loxes);

    errorLox.openLoxes = this._loxes.getOpenLoxes();

    return errorLox;
  }

  private toOutputLox(lox: Lox): OutputLox {
    const outputLox = new OutputLox(lox);
    outputLox.setTime(this.getTimeConsumption(outputLox));
    const mod = this._modules.get(outputLox);
    outputLox.moduleText = mod.slicedName;
    outputLox.color = mod.color;
    outputLox.hidden = mod.hidden;
    outputLox.box = this._boxFactory.getLogBox(outputLox, this._loxes);

    return outputLox;
  }

  private getTimeConsumption(lox: Lox) {
    const openLox = this._loxes.findOpenLox(lox.id);
    if (lox.type === 'open' || !is(openLox)) {
      return { coloredTimeText: '', timeText: '' };
    }
    const timeConsumption = lox.timestamp.getTime() - openLox.timestamp.getTime();
    const timeText = `[${timeConsumption.toString()}ms]`;

    return { timeConsumption, timeText };
  }
}

/**
 * This is the main class of Loxer. It works "static" because it's a singleton instance though you
 * don't need to call ~`new Loxer()`~. Instead you use it with **`Loxer.log()`** (or any other method).
 *
 * ### For an overview of all methods and a guide on how to use it, take a look at the [Documentation](https://github.com/pcprinz/loxer/blob/master/documentation/index.md).
 */
export let Loxer: LoxerType = new LoxerInstance();

export function resetLoxer(): void {
  Loxer = new LoxerInstance();
  Lox.resetStaticRunningId();
}
