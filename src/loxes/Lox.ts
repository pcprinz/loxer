import { LevelType } from '../types';

export type LoxType = 'single' | 'open' | 'close' | 'error';

export interface LoxProps {
  id: number;
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

  constructor(props: LoxProps) {
    this.id = props.id;
    this.message = props.message;
    this.highlighted = props.highlighted;
    this.item = props.item;
    this.type = props.type;
    this.moduleId = props.moduleId;
    this.level = props.level;
    this.timestamp = new Date();
  }
}
