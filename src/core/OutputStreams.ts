import { ErrorLox } from '../loxes/ErrorLox';
import { OutputLox } from '../loxes/OutputLox';
import { LoxerCallbacks } from '../types';
import { ANSIFormat } from './ANSIFormat';
import { BoxFactory } from './BoxFactory';
import { Item } from './Item';
import { LoxHistory } from './LoxHistory';

interface OutputStreamsProps {
  callbacks?: LoxerCallbacks;
  disableColors?: boolean;
  boxFactory?: BoxFactory;
  endTitleOpacity?: number;
  highlightColor?: string;
  moduleTextSlice?: number;
}

/** @internal */
export class OutputStreams {
  private _callbacks: LoxerCallbacks | undefined;
  private _colorsDisabled: boolean;
  private _boxFactory: BoxFactory;
  private _endTitleOpacity: number = 0;
  private _highlightColor: string | undefined;
  private _moduleTextSlice: number = 8;

  constructor(props?: OutputStreamsProps) {
    this._callbacks = props?.callbacks;
    this._colorsDisabled = props?.disableColors ? props.disableColors : false;
    this._boxFactory = props?.boxFactory ? props.boxFactory : new BoxFactory();
    this._endTitleOpacity = props?.endTitleOpacity ? props.endTitleOpacity : 0;
    this._highlightColor = props?.highlightColor;
    this._moduleTextSlice = props?.moduleTextSlice ? props.moduleTextSlice : 8;
  }

  /** @internal **/
  errorOut(dev: boolean, errorLox: ErrorLox, history: LoxHistory): void {
    dev ? this.devErrorOut(errorLox, history) : this.prodErrorOut(errorLox, history);
  }

  /** @internal **/
  logOut(dev: boolean, outputLox: OutputLox): void {
    dev ? this.devLogOut(outputLox) : this.prodLogOut(outputLox);
  }

  private devErrorOut(errorLox: ErrorLox, history: LoxHistory): void {
    if (this._callbacks?.devError) {
      this._callbacks.devError(errorLox, history.stack);
    } else {
      const { message, moduleText, timeText } = this._colorsDisabled
        ? errorLox
        : ANSIFormat.colorLox(errorLox);
      const box = this._boxFactory.getBoxString(errorLox.box, !this._colorsDisabled);
      const msg = moduleText + box + message + timeText;
      const stack = errorLox.highlighted && errorLox.error.stack ? errorLox.error.stack : '';
      const openLogs =
        errorLox.highlighted && errorLox.openLoxes.length > 0
          ? `\nOPEN_LOGS: [${errorLox.openLoxes
              .map((outputLox) => outputLox.message)
              .join(' <> ')}]`
          : '';

      errorLox.item
        ? console.error(msg + stack + openLogs, errorLox.item)
        : console.error(msg + stack + openLogs);
    }
  }

  private prodErrorOut(errorLox: ErrorLox, history: LoxHistory): void {
    if (this._callbacks?.prodError) {
      this._callbacks.prodError(errorLox, history.stack);
    }
  }

  private devLogOut(outputLox: OutputLox): void {
    if (this._callbacks?.devLog) {
      this._callbacks.devLog(outputLox);
    } else {
      // colored option
      const opacity = outputLox.type === 'close' ? this._endTitleOpacity : 1;
      const { message, moduleText, timeText } = this._colorsDisabled
        ? outputLox
        : ANSIFormat.colorLox(outputLox, opacity, this._highlightColor);
      const box = this._boxFactory.getBoxString(outputLox.box, !this._colorsDisabled);
      const str = `${moduleText}${box}${message}\t${timeText}`;
      if (outputLox.item) {
        const itm = new Item(outputLox.item, outputLox.itemOptions);
        console.log(
          str +
            itm.prettify(true, {
              depth: this._moduleTextSlice + outputLox.box.length,
              color: outputLox.color,
            })
        );
      } else {
        console.log(str);
      }
    }
  }

  private prodLogOut(outputLox: OutputLox): void {
    if (this._callbacks?.prodLog) {
      this._callbacks.prodLog(outputLox);
    }
  }
}
