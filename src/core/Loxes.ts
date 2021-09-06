import { filterDef, isNumber } from '../Helpers';
import { OutputLox } from '../loxes';
import { Lox } from '../loxes/Lox';

/** @internal
 * A storage for pending and open loxes
 */
export class Loxes {
  private _pendingLoxQueue: Lox[] = [];
  private _shouldUseQueue = true;

  private _loxes: { [id: string]: OutputLox | undefined } = {};
  private _openBuffer: (number | undefined)[] = [];

  /** @internal add / removes an open lox from the list of opened logs, depending on it's type */
  proceed(lox: OutputLox) {
    if (lox.type === 'open') {
      this._loxes[lox.id] = lox;
      if (!lox.hidden) {
        this._openBuffer.push(lox.id);
      }
    } else if (lox.type === 'close') {
      this._loxes[lox.id] = undefined;
      const index = this._openBuffer.indexOf(lox.id);
      if (index > -1) {
        this._openBuffer[index] = undefined;
      }
      // remove undefined buffer end
      let done = false;
      while (!done) {
        if (this._openBuffer.length > 0 && !this._openBuffer[this._openBuffer.length - 1]) {
          this._openBuffer.pop();
        } else {
          done = true;
        }
      }
    }
  }
  /** @internal finds an opening log || undefined */
  findOpenLox(id: number): Lox | undefined {
    if (isNumber(id)) {
      return this._shouldUseQueue
        ? this._pendingLoxQueue.find(item => item.type === 'open' && item?.id === id)
        : this._loxes[id];
    } else {
      return undefined;
    }
  }

  /** @internal returns all defined open loxes */
  getOpenLoxes(): OutputLox[] {
    const openLoxes = filterDef(this._openBuffer).map(openLogId => this._loxes[openLogId]);
    return filterDef(openLoxes);
  }

  /** @internal returns the open lox buffer with all open loxes or undefined */
  getBuffer(): (OutputLox | undefined)[] {
    return this._openBuffer.map(id => (id ? this._loxes[id] : undefined));
  }

  /** @internal enqueues any lox to the pending queue */
  enqueue(log: Lox) {
    this._pendingLoxQueue.push(log);
  }

  /** @internal empties the pending queue and returns all pending loxes */
  dequeue(): Lox[] {
    const queue = this._pendingLoxQueue;
    this._pendingLoxQueue = [];
    this._shouldUseQueue = false;
    return queue;
  }
}
