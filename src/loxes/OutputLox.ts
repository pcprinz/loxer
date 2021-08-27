import { Lox } from './Lox';
/** @module OutputLox */

/** This is a log streamed to the `devLog`or `prodLog` output stream defined at the {@link LoxerCallbacks}. */
export class OutputLox extends Lox {
  /** the possibly sliced text of the logs corresponding module
   * - is `''` if no module (`NONE`) or the default module (`DEFAULT`) was given
   */
  moduleText: string | '' = '';
  /** the box layout of the log */
  box: string | '' = '';
  /** a string that represents the time consumption from the opening log's `timestamp` until this log appeared
   * - is `''` when the log is a single `Loxer.log()` or an opening log itself
   */
  timeText: string | '' = '';
  /** the time consumption (in `ms`) from the opening log's `timestamp` until this log appeared
   * - is `undefined` when the log is a single `Loxer.log()` or an opening log itself
   */
  timeConsumption: number | undefined;
  /**
   * The colored versions of the log's `message`, `moduleText`, `box` and `timeText`
   * - the coloring is done by wrapping the strings in {@link https://talyian.github.io/ansicolors/ ANSI Color Codes}
   * - some consoles / platforms don't support the `\x1b[m` color codes. in that case it's reccommended to use the
   *   uncolored strings
   *
   * You can easily switch between colored / uncolored versions like that:
   *
   * ```typescript
   * const useColored = true; // switch here
   * const { box, message, moduleText, timeText } = useColored ? outputLox.colored : outputlox;
   * ```
   *
   * This is possible because the keys are named exactly the same. Loxer internally
   */
  colored: {
    message: string;
    moduleText: string | '';
    box: string | '';
    timeText: string | '';
  };
  /** determines if the log has not fulfilled the level that the corresponding module has set */
  hidden: boolean = false;

  /** @internal */
  constructor(prelog: Lox, coloredMessage: string) {
    super(prelog);
    this.colored = {
      message: coloredMessage,
      moduleText: '',
      box: '',
      timeText: '',
    };
  }

  /** @internal */
  setTime(times: {
    timeText: string;
    coloredTimeText: string;
    timeConsumption?: number;
  }) {
    this.timeText = times.timeText;
    this.colored.timeText = times.coloredTimeText;
    this.timeConsumption = times.timeConsumption;
  }

  /** @internal */
  setModuleText(texts: { moduleText: string; coloredModuleText: string }) {
    this.moduleText = texts.moduleText;
    this.colored.moduleText = texts.coloredModuleText;
  }

  /** @internal */
  setBox(boxes: { box: string; cBox: string }) {
    this.box = boxes.box;
    this.colored.box = boxes.cBox;
  }
}
