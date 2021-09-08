import { BoxFactory } from './core/BoxFactory';
import { Loxes } from './core/Loxes';
import { LoxHistory } from './core/LoxHistory';
import { Modules } from './core/Modules';
import { OutputStreams } from './core/OutputStreams';
import { ensureError, is, isNES, LoxerError } from './Helpers';
import { ErrorLox, OutputLox } from './loxes';
import { Lox, LoxType } from './loxes/Lox';
import { ErrorType, LogLevelType, Loxer as LoxerType, LoxerOptions, OfLoxes } from './types';

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
    if (is(props?.dev)) {
      this._dev = props!.dev;
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
      moduleTextSlice: config?.moduleTextSlice,
      defaultLevels: props?.defaultLevels,
    });
    this._history = new LoxHistory(config?.historyCacheSize);
    this._boxFactory = new BoxFactory(config?.boxLayoutStyle);
    this._output = new OutputStreams({
      callbacks: props?.callbacks,
      disableColors: config?.disableColors,
      boxFactory: this._boxFactory,
      endTitleOpacity: config?.endTitleOpacity,
      highlightColor: config?.highlightColor,
    });

    this.highlight().log('Loxer initialized');
    this._loxes.dequeue().forEach(queued => this.switchOutput(queued));
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

  log(message: string = '', item?: any) {
    if (this._disabled) {
      return;
    }
    this.switchOutput(
      new Lox({
        id: undefined,
        highlighted: this._highlighted,
        item,
        level: this._level ?? 1,
        message,
        moduleId: this._moduleId,
        type: 'single',
      })
    );
  }

  error(error: ErrorType, item?: any) {
    this.internalError(error, undefined, undefined, undefined, item);
  }

  private internalError(
    error: ErrorType,
    logId: number | undefined,
    moduleId: string = this._moduleId,
    messagePrefix: string = '',
    item?: any
  ) {
    const sureError = ensureError(error);
    this.switchOutput(
      new Lox({
        id: logId,
        highlighted: this._highlighted,
        item,
        level: this._level ?? 1,
        message: messagePrefix + sureError.message,
        moduleId,
        type: 'error',
      }),
      sureError
    );
  }

  open(message: string, item?: any) {
    if (this._disabled) {
      return 0;
    }
    const lox = new Lox({
      id: undefined,
      highlighted: this._highlighted,
      item,
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
        add: (message: string, item?: any) => {
          this.internalError(
            new LoxerError(message),
            id,
            undefined,
            'add() on a not (anymore) existing Lox. MESSAGE: ',
            item
          );
        },
        close: (message: string, item?: any) => {
          this.internalError(
            new LoxerError(message),
            id,
            undefined,
            'close() on a not (anymore) existing Lox. MESSAGE: ',
            item
          );
        },
        error: (error: ErrorType, item?: any) => {
          this.internalError(
            error,
            id,
            undefined,
            'error() on a not (anymore) existing Lox. ERROR: ',
            item
          );
        },
      };
    } else {
      return {
        add: (message: string, item?: any) => {
          this.appendLox('single', openLox, message, item);
        },
        close: (message: string, item?: any) => {
          this.appendLox('close', openLox, message, item);
        },
        error: (error: ErrorType, item?: any) => {
          this.internalError(error, openLox.id, openLox.moduleId, undefined, item);
        },
      };
    }
  }

  private appendLox(type: LoxType, openLox: Lox, message: string, item?: any) {
    const { id, moduleId, level: oLevel } = openLox;
    // close level must be open level + added logs must not have a lower level, though the open box could possibly not exist
    const level =
      type === 'single' ? (Math.max(oLevel, this._level ?? oLevel) as LogLevelType) : oLevel;
    this.switchOutput(
      new Lox({
        id,
        highlighted: this._highlighted,
        item,
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
      this._loxes.enqueue(lox);
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
    outputLox.color = this._modules.getColor(outputLox.moduleId);
    outputLox.moduleText = this._modules.getText(outputLox);
    outputLox.box = this._boxFactory.getLogBox(outputLox, this._loxes);

    outputLox.hidden = this._modules.isLogHidden(outputLox);

    return outputLox;
  }

  private getTimeConsumption(lox: Lox) {
    const openLox = this._loxes.findOpenLox(lox.id);
    if (lox.type === 'open' || !is(openLox)) {
      return { coloredTimeText: '', timeText: '' };
    }
    const timeConsumption = lox.timestamp.getTime() - openLox.timestamp.getTime();
    const timeText = '[' + timeConsumption.toString() + 'ms]';

    return { timeConsumption, timeText };
  }
}

export let Loxer: LoxerType = new LoxerInstance();

export function resetLoxer() {
  Loxer = new LoxerInstance();
  Lox.resetStaticRunningId();
}
