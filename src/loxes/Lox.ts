import { is } from '../Helpers';
import { LevelType } from '../types';
/** @module Lox */

export type LoxType = 'single' | 'open' | 'close' | 'error';

/** @internal */
export interface LoxProps {
  id: number | undefined;
  message: string;
  highlighted: boolean;
  item: any | undefined;
  type: LoxType;
  moduleId: string;
  level: LevelType;
}

/** The basic log that every {@link OutputLox} and {@link ErrorLox} extend */
export class Lox {
  /** the internal identifier of the log
   * - this id is used to reference `.of(id)` logs to opening logs
   */
  id: number;
  /** the message of the log */
  message: string;
  /** determines if the log was highlighted with `Loxer.highlight()` or `Loxer.h()` */
  highlighted: boolean;
  /** an optional item like the `console.log(message,`**_`item`_**`)` */
  item: any | Error | undefined;
  /** the {@link LoxType type} of the log */
  type: LoxType;
  /** the corresponding key of a module from {@link LoxerOptions.modules}
   * - will be `DEFAULT` if logged with empty module `Loxer.module()` or `Loxer.m()`
   * - will be `NONE` if logged without a module
   * - will be `INVALID` if logged with a module that was not defined at {@link LoxerOptions.modules}
   */
  moduleId: string;
  /** the log level that was given with `Loxer.level(number)` or `Loxer.l(number)` */
  level: LevelType;
  /** the {@link Date} the log was declared */
  timestamp: Date;

  /** @internal */
  constructor(props: LoxProps) {
    this.id = props.id ?? Lox.nextId();
    this.message = props.message;
    this.highlighted = props.highlighted;
    this.item = props.item;
    this.type = props.type;
    this.moduleId = props.moduleId;
    this.level = props.level;
    this.timestamp = new Date();
  }

  /** TODO: i think this does not work with boxes?!
   * compares another lox with this one. Loxes are equal if their `id` is the same
   * @param obj to compare on equality
   * @returns true if both have the same id
   */
  equals(obj: unknown) {
    return is(obj) && obj instanceof Lox ? obj.id === this.id : false;
  }

  // id #####################################################################
  private static _runningId: number = -1;
  private static nextId(): number {
    this._runningId = (this._runningId + 1) % Number.MAX_VALUE;

    return this._runningId;
  }
}
