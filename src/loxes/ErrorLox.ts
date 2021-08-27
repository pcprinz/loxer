import { Lox } from './Lox';
import { OutputLox } from './OutputLox';

/** This is a log streamed to the `devError`or `prodError` output stream defined at the {@link LoxerCallbacks}.
 * It extends the {@link OutputLox} wich itself extends the basic {@link Lox}.
 */
export class ErrorLox extends OutputLox {
  /** the error that was initially given, or created by Loxer */
  error: Error;
  /** a list of opened {@link OutputLox} which have not been closed until the occurrence of this error log */
  openLoxes: OutputLox[] = [];
  /** a full history of all {@link OutputLox} and `ErrorLox` which have occurred before this error log
   * - The {@link Loxer.history} must be enabled by setting the {@link LoxerConfig.historyCacheSize} in the
   *   {@link LoxerOptions.config} declared in `Loxer.init(options)`
   */
  history: (OutputLox | ErrorLox)[] = [];

  constructor(prelog: Lox, error: Error, coloredMessage: string) {
    super(prelog, coloredMessage);
    this.error = error;
  }
}
