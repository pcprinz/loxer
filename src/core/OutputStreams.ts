import { ErrorLox, OutputLox } from '../loxes';
import { LoxerCallbacks } from '../types';
import { BoxFactory } from './BoxFactory';
import { LoxHistory } from './LoxHistory';

interface OutputStreamsProps {
  callbacks?: LoxerCallbacks;
  disableColors?: boolean;
  boxFactory?: BoxFactory;
}

/** @internal */
export class OutputStreams {
  private _callbacks: LoxerCallbacks | undefined;
  private _colorsDisabled: boolean;
  private _boxFactory: BoxFactory;

  constructor(props?: OutputStreamsProps) {
    this._callbacks = props?.callbacks;
    this._colorsDisabled = props?.disableColors ?? false;
    this._boxFactory = props?.boxFactory ?? new BoxFactory();
  }

  /** @internal **/
  errorOut(dev: boolean, errorLox: ErrorLox, history: LoxHistory) {
    dev ? this.devErrorOut(errorLox, history) : this.prodErrorOut(errorLox, history);
  }

  /** @internal **/
  logOut(dev: boolean, outputLox: OutputLox) {
    dev ? this.devLogOut(outputLox) : this.prodLogOut(outputLox);
  }

  private devErrorOut(errorLox: ErrorLox, history: LoxHistory) {
    if (this._callbacks?.devError) {
      this._callbacks.devError(errorLox, history.stack);
    } else {
      const { message, moduleText, timeText } = this._colorsDisabled ? errorLox : errorLox.colored;
      const box = this._boxFactory.getBoxString(errorLox.box, !this._colorsDisabled);
      const msg = moduleText + box + message + timeText;
      const stack = errorLox.highlighted && errorLox.error.stack ? errorLox.error.stack : '';
      const openLogs =
        errorLox.highlighted && errorLox.openLoxes.length > 0
          ? `\nOPEN_LOGS: [${errorLox.openLoxes.map(outputLox => outputLox.message).join(' <> ')}]`
          : '';

      errorLox.item
        ? console.error(msg + stack + openLogs, errorLox.item)
        : console.error(msg + stack + openLogs);
    }
  }

  private prodErrorOut(errorLox: ErrorLox, history: LoxHistory) {
    if (this._callbacks?.prodError) {
      this._callbacks.prodError(errorLox, history.stack);
    }
  }

  private devLogOut(outputLox: OutputLox) {
    if (this._callbacks?.devLog) {
      this._callbacks.devLog(outputLox);
    } else {
      // colored option
      const { message, moduleText, timeText } = this._colorsDisabled
        ? outputLox
        : outputLox.colored;
      const box = this._boxFactory.getBoxString(outputLox.box, !this._colorsDisabled);
      const str = moduleText + box + message + timeText;
      outputLox.item ? console.log(str, outputLox.item) : console.log(str);
    }
  }

  private prodLogOut(outputLox: OutputLox) {
    if (this._callbacks?.prodLog) {
      this._callbacks.prodLog(outputLox);
    }
  }
}
