import {
  ANSI_CODE,
  Box,
  BoxLayouts,
  closeLogColor,
  getServiceColor,
  highlightColor,
  timeColor,
  warnBackgroundColor,
  warnColor,
} from './ColorCode';
import {
  DEFAULT_MODULES,
  ensureError,
  filterDef,
  is,
  isError,
  isNES,
  isNumber,
  LoxerError,
} from './Helpers';
import { ErrorLox } from './loxes/ErrorLox';
import { Lox, LoxType } from './loxes/Lox';
import { OutputLox } from './loxes/OutputLox';
import {
  ErrorType,
  LogLevelType,
  Loxer as LoxerType,
  LoxerCallbacks,
  LoxerConfig,
  LoxerModules,
  LoxerOptions,
  OfLoxes,
} from './types';

class LoxerInstance implements LoxerType {
  private _initialized: boolean;
  private _dev: boolean;
  private _disabled: boolean;
  private _loxes: { [id: number]: Lox | undefined };
  private _modules: LoxerModules;
  private _callbacks: LoxerCallbacks | undefined;
  private _config: LoxerConfig;

  constructor() {
    this._initialized = false;
    this._dev = false;
    this._disabled = false;
    this._loxes = {};
    this._modules = DEFAULT_MODULES;
    this._config = {
      moduleTextSlice: 8,
      endTitleOpacity: 0,
      boxLayoutStyle: 'round',
      disableColors: false,
      historyCacheSize: 0,
      disabledInProductionMode: false,
    };
  }

  init(props?: LoxerOptions) {
    this._initialized = true;
    if (is(props?.dev)) {
      this._dev = props!.dev;
    } else {
      this._dev = isNES(process.env.NODE_ENV)
        ? 'development' === process.env.NODE_ENV
        : false;
    }
    if (props?.config?.disabled) {
      this._disabled = true;
    } else {
      this._disabled = props?.config?.disabledInProductionMode
        ? !this._dev
        : false;
    }
    if (props?.defaultLevels) {
      DEFAULT_MODULES[0].develLevel = props?.defaultLevels.develLevel;
      DEFAULT_MODULES[1].develLevel = props?.defaultLevels.develLevel;
      DEFAULT_MODULES[0].prodLevel = props?.defaultLevels.prodLevel;
      DEFAULT_MODULES[1].prodLevel = props?.defaultLevels.prodLevel;
    }
    this._modules = {
      ...DEFAULT_MODULES,
      ...props?.modules,
    };
    this._callbacks = props?.callbacks;
    const c = props?.config;
    this._config.moduleTextSlice = c?.moduleTextSlice ?? 8;
    this._config.endTitleOpacity = c?.endTitleOpacity ?? 0;
    this._config.boxLayoutStyle = c?.boxLayoutStyle ?? 'round';
    this._config.highlightColor = c?.highlightColor;
    this._config.disableColors = is(c?.disableColors)
      ? c?.disableColors
      : false;
    this._config.historyCacheSize = c?.historyCacheSize ?? 0;

    this.highlight().log('Loxer initialized');
    this.dequeueLoxes();
  }

  getModuleLevel(moduleId: string) {
    const level = this._dev
      ? this._modules[moduleId]?.develLevel
      : this._modules[moduleId]?.prodLevel;

    return level ?? -1;
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

  private isLogHidden(lox: Lox): boolean {
    const dl = this._modules[lox.moduleId]?.develLevel ?? 1;
    const pl = this._modules[lox.moduleId]?.prodLevel ?? 1;

    return this._dev ? dl === 0 || lox.level > dl : pl === 0 || lox.level <= pl;
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
            this._loxes[id]?.moduleId,
            'add() on a not (anymore) existing Lox. MESSAGE: ',
            item
          );
        },
        close: (message: string, item?: any) => {
          this.internalError(
            new LoxerError(message),
            id,
            this._loxes[id]?.moduleId,
            'close() on a not (anymore) existing Lox. MESSAGE: ',
            item
          );
        },
        error: (error: ErrorType, item?: any) => {
          this.internalError(
            error,
            id,
            this._loxes[id]?.moduleId,
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
          this.internalError(
            error,
            openLox.id,
            this._loxes[openLox.id]?.moduleId,
            undefined,
            item
          );
        },
      };
    }
  }

  private appendLox(type: LoxType, openLox: Lox, message: string, item?: any) {
    const { id, moduleId, level } = openLox;
    // close level must be open level + added logs must not have a lower level, though the open box could possibly not exist
    const fixedLevel =
      type === 'single'
        ? (Math.max(level, this._level ?? level) as LogLevelType)
        : level;
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

  // log buffer #############################################################

  private _openLoxIdBuffer: (number | undefined)[] = [];
  private addToBuffer(log: Lox) {
    if (log.type === 'open') {
      this._openLoxIdBuffer.push(log.id);
    }
  }
  private removeFromBuffer(log: Lox) {
    if (log.type === 'close') {
      const index = this._openLoxIdBuffer.indexOf(log.id);
      if (index > -1) {
        this._openLoxIdBuffer[index] = undefined;
      }
      // remove undefined buffer end
      let done = false;
      while (!done) {
        if (
          this._openLoxIdBuffer.length > 0 &&
          !this._openLoxIdBuffer[this._openLoxIdBuffer.length - 1]
        ) {
          this._openLoxIdBuffer.pop();
        } else {
          done = true;
        }
      }
    }
  }

  // logs queue #############################################################

  private _pendingLoxQueue: Lox[] = [];
  private enqueueLox(log: Lox) {
    this._pendingLoxQueue.push(log);
  }
  private dequeueLoxes() {
    if (this._disabled) {
      this._pendingLoxQueue = [];
    } else {
      this._pendingLoxQueue.forEach(log => this.switchOutput(log));
    }
  }

  // history ################################################################
  // LIFO (reversed stack)
  private _history: (OutputLox | ErrorLox)[] = [];
  private addToHistory(lox: OutputLox | ErrorLox) {
    if ((this._config?.historyCacheSize ?? 0) > 0) {
      this._history = [lox, ...this._history.slice(0, -1)];
    }
  }
  get history(): (OutputLox | ErrorLox)[] {
    return this._history;
  }

  // output #################################################################

  private switchOutput(lox: Lox, error?: Error) {
    this.resetState();

    // TODO should errors really be hold back until init?
    if (!this._initialized) {
      this.enqueueLox(lox);
    } else if (lox.type === 'error') {
      const errorLox = this.generateErrorLox(lox, error!);
      this.addToHistory(errorLox);
      this._dev ? this.devErrorOut(errorLox) : this.prodErrorOut(errorLox);
    } else {
      const outputLox = this.generateOutputLox(lox);
      if (!outputLox.hidden) {
        this.addToBuffer(lox);
        this.addToHistory(outputLox);
        this._dev ? this.devLogOut(outputLox) : this.prodLogOut(outputLox);
        this.removeFromBuffer(lox);
      }
    }
  }

  private generateErrorLox(lox: Lox, error: Error): ErrorLox {
    const errorName = isError(error) ? error.name : 'Error';
    const coloredMessage =
      warnBackgroundColor(errorName) + ': ' + warnColor(lox.message);
    const errorLox = new ErrorLox(lox, error, coloredMessage);

    errorLox.setModuleText(this.getModuleText(errorLox));
    errorLox.box = this.getOfLogBox(errorLox);
    const openLoxes = filterDef(this._openLoxIdBuffer).map(
      openLogId => this._loxes[openLogId]
    );
    errorLox.openLoxes = filterDef(openLoxes).map(errorLoxLog =>
      this.generateOutputLox(errorLoxLog)
    );
    errorLox.history = this.history;

    return errorLox;
  }

  private devErrorOut(errorLox: ErrorLox) {
    if (this._callbacks?.devError) {
      this._callbacks.devError(errorLox);
    } else {
      const { message, moduleText, timeText } = this._config?.disableColors
        ? errorLox
        : errorLox.colored;
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

  private prodErrorOut(errorLox: ErrorLox) {
    if (this._callbacks?.prodError) {
      this._callbacks.prodError(errorLox);
    }
  }

  private devLogOut(outputLox: OutputLox) {
    if (this._callbacks?.devLog) {
      this._callbacks.devLog(outputLox);
    } else {
      // colored option
      const { message, moduleText, timeText } = this._config?.disableColors
        ? outputLox
        : outputLox.colored;
      const box = this.getBoxString(
        outputLox.box,
        !this._config?.disableColors
      );
      const str = moduleText + box + message + timeText;
      outputLox.item ? console.log(str, outputLox.item) : console.log(str);
    }
  }

  private prodLogOut(outputLox: OutputLox) {
    if (this._callbacks?.prodLog) {
      this._callbacks.prodLog(outputLox);
    }
  }

  // styling ################################################################

  private generateOutputLox(lox: Lox): OutputLox {
    let coloredMessage = lox.highlighted
      ? highlightColor(lox.message, this._config.highlightColor)
      : lox.message;
    const outputLox = new OutputLox(lox, coloredMessage);
    outputLox.setTime(this.getTimeConsumption(lox));
    outputLox.setModuleText(this.getModuleText(lox));
    outputLox.hidden = this.isLogHidden(lox);
    if (!outputLox.hidden) {
      switch (lox.type) {
        case 'open':
          outputLox.box = this.getOpenLogBox(lox);
          break;
        case 'close':
          outputLox.box = this.getOfLogBox(lox);
          outputLox.colored.message = this._highlighted
            ? coloredMessage
            : closeLogColor(lox.message);
          break;
        case 'single':
          outputLox.box = this.getOfLogBox(lox);
      }
    }

    return outputLox;
  }

  private getTimeConsumption(log: Lox) {
    const openLox = this._loxes[log.id];
    if (log.type === 'open' || !is(openLox)) {
      return { coloredTimeText: '', timeText: '' };
    }
    const timeConsumption =
      log.timestamp.getTime() - openLox.timestamp.getTime();
    const timeText = '   [' + timeConsumption.toString() + 'ms]';
    const coloredTimeText = timeColor(timeText);

    return { timeConsumption, timeText, coloredTimeText };
  }

  private getModuleText(lox: Lox) {
    let module = this._modules[lox.moduleId];
    if (!is(module)) {
      lox.moduleId = 'INVALID';
      module = this._modules.INVALID;
    }
    const opacity =
      lox.type !== 'close' ? 1 : this._config.endTitleOpacity ?? 0;
    let moduleText =
      module.fullname.length > 0 && opacity > 0
        ? module.fullname.slice(0, this._config.moduleTextSlice) + ': '
        : '';
    const moduleTextLength =
      lox.moduleId === 'NONE' ? 0 : this._config.moduleTextSlice! + 2;
    for (let i = moduleText.length; i < moduleTextLength; i++) {
      moduleText += ' ';
    }
    const coloredModuleText = module
      ? getServiceColor(module.color, opacity) + moduleText + ANSI_CODE.Reset
      : moduleText;

    return { moduleText, coloredModuleText };
  }

  private getLoxColor(loxId: number | undefined): string {
    if (!is(loxId)) {
      return '';
    }
    const loxLog = this._loxes[loxId];
    if (!is(loxLog) || !is(loxLog?.moduleId)) {
      return '';
    }

    return this.getModuleColor(loxLog.moduleId);
  }

  private getModuleColor(moduleId: string): string {
    const module = this._modules[moduleId];
    if (!is(module) || !is(module.color)) {
      return '';
    }

    return module.color;
  }

  // boxes ##################################################################

  private getOpenLogBox(lox: Lox): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = this.getModuleColor(lox.moduleId);
    // print the depth before the start
    for (const openLoxId of this._openLoxIdBuffer) {
      if (openLoxId === lox.id) {
        break;
      }
      box.push(
        openLoxId
          ? { box: 'vertical', color: this.getLoxColor(openLoxId) }
          : 'empty'
      );
    }
    // print the start of the box
    box.push({ box: 'openEdge', color });
    box.push({ box: 'openEnd', color });

    return box;
  }

  private getOfLogBox(lox: Lox): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = this.getModuleColor(lox.moduleId);
    let found = false;
    for (const id of this._openLoxIdBuffer) {
      const itemColor = this.getLoxColor(id);
      if (!found) {
        if (id !== lox.id) {
          // print depth before occurrence
          box.push(
            id
              ? {
                  box: 'vertical',
                  color: itemColor,
                }
              : 'empty'
          );
        } else {
          // print occurrence
          box.push({
            box: lox.type === 'close' ? 'closeEdge' : 'single',
            color,
          });
          found = true;
        }
      } else {
        // print depth after occurrence
        box.push(
          id
            ? {
                box: 'cross',
                color: itemColor,
              }
            : {
                box: 'horizontal',
                color,
              }
        );
      }
    }
    // print line end
    box.push({
      box: lox.type === 'close' ? 'closeEnd' : 'horizontal',
      color,
    });

    return box;
  }

  private getBoxString(box: Box, colored: boolean | undefined) {
    return box
      .map(segment => {
        if (segment === 'empty') {
          return ' ';
        } else if (colored) {
          return (
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
}

export const Loxer: LoxerType = new LoxerInstance();
