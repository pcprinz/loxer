import {
  closeLogColor,
  highlightColor,
  timeColor,
  warnBackgroundColor,
  warnColor
} from './ColorCode';
import {BoxFactory} from './core/BoxFactory';
import {LoxHistory} from './core/LoxHistory';
import {Modules} from './core/Modules';
import {OpenLoxBuffer} from './core/OpenLoxBuffer';
import {OutputStreams} from './core/OutputStreams';
import {
  ensureError,
  filterDef,
  is,
  isError,
  isNES,
  isNumber,
  LoxerError
} from './Helpers';
import {ErrorLox} from './loxes/ErrorLox';
import {Lox, LoxType} from './loxes/Lox';
import {OutputLox} from './loxes/OutputLox';
import {
  ErrorType,
  LogLevelType,
  Loxer as LoxerType, LoxerOptions,
  OfLoxes
} from './types';

/** @internal */
export type LoxesType = { [id: number]: Lox | undefined };
class LoxerInstance implements LoxerType {
  private _openLoxBuffer = new OpenLoxBuffer();
  private _history = new LoxHistory();
  private _modules: Modules = new Modules();
  private _boxFactory: BoxFactory = new BoxFactory();
  private _output: OutputStreams = new OutputStreams();

  private _initialized: boolean = false;
  private _dev: boolean = false;
  private _disabled: boolean = false;
  private _loxes: LoxesType = {};
  private _highlightColor: string | undefined;

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
    this._highlightColor = config?.highlightColor;
    this._modules = new Modules({
      dev: this._dev,
      modules: props?.modules,
      endTitleOpacity: config?.endTitleOpacity,
      moduleTextSlice: config?.moduleTextSlice,
    });
    this._history = new LoxHistory(config?.historyCacheSize);
    this._boxFactory = new BoxFactory(this._modules, config?.boxLayoutStyle);
    this._output = new OutputStreams({
      callbacks: props?.callbacks,
      disableColors: config?.disableColors,
      boxFactory: new BoxFactory(this._modules, config?.boxLayoutStyle),
    });

    this.highlight().log('Loxer initialized');
    this.dequeueLoxes();
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

    return this;
  }

  // id #####################################################################

  private _runningId: number = -1;
  private getId(): number {
    this._runningId = (this._runningId + 1) % Number.MAX_VALUE;

    return this._runningId;
  }

  // log functions ##########################################################

  log(message: string = '', item?: any) {
    if (this._disabled) {
      return;
    }
    this.switchOutput(
      new Lox({
        id: this.getId(),
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
    logId: number = this.getId(),
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
    const id = this.getId();
    const lox = new Lox({
      id,
      highlighted: this._highlighted,
      item,
      level: this._level ?? 1,
      message,
      moduleId: this._moduleId !== 'NONE' ? this._moduleId : 'DEFAULT',
      type: 'open',
    });
    this._loxes[id] = lox;
    this.switchOutput(lox);

    return id;
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
    const openLox = isNumber(id) ? this._loxes[id] : undefined;
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
          this._loxes[openLox.id] = undefined;
        },
        error: (error: ErrorType, item?: any) => {
          this.internalError(error, openLox.id, openLox.moduleId, undefined, item);
        },
      };
    }
  }

  private appendLox(type: LoxType, openLox: Lox, message: string, item?: any) {
    const { id, moduleId, level } = openLox;
    // close level must be open level + added logs must not have a lower level, though the open box could possibly not exist
    const fixedLevel =
      type === 'single' ? (Math.max(level, this._level ?? level) as LogLevelType) : level;
    this.switchOutput(
      new Lox({
        id,
        highlighted: this._highlighted,
        item,
        level: fixedLevel,
        message,
        moduleId,
        type,
      })
    );
  }

  // logs queue #############################################################

  private _pendingLoxQueue: Lox[] = [];
  private enqueueLox(log: Lox) {
    this._pendingLoxQueue.push(log);
  }
  private dequeueLoxes() {
    if (!this._disabled) {
      this._pendingLoxQueue.forEach(log => this.switchOutput(log));
    }
    this._pendingLoxQueue = []
  }

  // output #################################################################

  private switchOutput(lox: Lox, error?: Error) {
    this.resetState();

    // TODO should errors really be hold back until init?
    if (!this._initialized) {
      this.enqueueLox(lox);
    } else if (lox.type === 'error') {
      const errorLox = this.generateErrorLox(lox, error!);
      this._history.add(errorLox);
      this._output.errorOut(this._dev, errorLox);
    } else {
      const outputLox = this.generateOutputLox(lox);
      if (!outputLox.hidden) {
        this._openLoxBuffer.add(lox);
        this._history.add(outputLox);
        this._output.logOut(this._dev, outputLox);
        this._openLoxBuffer.remove(lox);
      }
    }
  }

  // styling ################################################################

  private generateErrorLox(lox: Lox, error: Error): ErrorLox {
    const errorName = isError(error) ? error.name : 'Error';
    const coloredMessage = warnBackgroundColor(errorName) + ': ' + warnColor(lox.message);
    const errorLox = new ErrorLox(lox, error, coloredMessage);

    errorLox.setModuleText(this._modules.getText(errorLox));
    errorLox.box = this._boxFactory.getOfLogBox(errorLox, this._loxes, this._openLoxBuffer);
    const openLoxes = this._openLoxBuffer.definedIds.map(openLogId => this._loxes[openLogId]);
    errorLox.openLoxes = filterDef(openLoxes).map(errorLoxLog =>
      this.generateOutputLox(errorLoxLog)
    );
    errorLox.history = this._history.stack;

    return errorLox;
  }

  private generateOutputLox(lox: Lox): OutputLox {
    let coloredMessage = lox.highlighted
      ? highlightColor(lox.message, this._highlightColor)
      : lox.message;
    const outputLox = new OutputLox(lox, coloredMessage);
    outputLox.setTime(this.getTimeConsumption(lox));
    outputLox.setModuleText(this._modules.getText(lox));
    outputLox.hidden = this._modules.isLogHidden(lox);
    if (!outputLox.hidden) {
      switch (lox.type) {
        case 'open':
          outputLox.box = this._boxFactory.getOpenLogBox(lox, this._loxes, this._openLoxBuffer);
          break;
        case 'close':
          outputLox.box = this._boxFactory.getOfLogBox(lox, this._loxes, this._openLoxBuffer);
          outputLox.colored.message = lox.highlighted ? coloredMessage : closeLogColor(lox.message);
          break;
        case 'single':
          outputLox.box = this._boxFactory.getOfLogBox(lox, this._loxes, this._openLoxBuffer);
      }
    }

    return outputLox;
  }

  private getTimeConsumption(log: Lox) {
    const openLox = this._loxes[log.id];
    if (log.type === 'open' || !is(openLox)) {
      return { coloredTimeText: '', timeText: '' };
    }
    const timeConsumption = log.timestamp.getTime() - openLox.timestamp.getTime();
    const timeText = '   [' + timeConsumption.toString() + 'ms]';
    const coloredTimeText = timeColor(timeText);

    return { timeConsumption, timeText, coloredTimeText };
  }
}

export const Loxer: LoxerType = new LoxerInstance();
