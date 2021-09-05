import { Lox } from './Lox';
import { OutputLox } from './OutputLox';
/** @module ErrorLox */

/** This is a log streamed to the `devError`or `prodError` output stream defined at the {@link LoxerCallbacks}. */
export class ErrorLox extends OutputLox {
  /** the error that was initially given, or created by Loxer */
  error: Error;
  /** a list of opened {@link OutputLox} which have not been closed until the occurrence of this error log */
  openLoxes: OutputLox[] = [];

  /** @internal */
  constructor(prelog: Lox, error: Error, coloredMessage: string) {
    super(prelog, coloredMessage);
    this.error = error;
  }
}
