import { filterDef, isNumber } from '../Helpers';
import { OutputLox } from '../loxes';
import { Lox } from '../loxes/Lox';

/** @internal
 * A storage for pending and open loxes
 */
export class Loxes {
  private _buffer: (OutputLox | undefined)[] = [];
  private _pendingLoxQueue: Lox[] = [];
  private _shouldUseQueue = true;

  /** @internal adds an open lox to the list of opened logs */
  add(lox: OutputLox) {
    if (lox.type === 'open') {
      this._buffer.push(lox);
    }
  }

  /** @internal removes an open lox from the list of opened logs */
  remove(lox: OutputLox) {
    if (lox.type === 'close') {
      const index = this._buffer.findIndex(openLox => openLox?.equals(lox));
      if (index > -1) {
        this._buffer[index] = undefined;
      }
      // remove undefined buffer end
      let done = false;
      while (!done) {
        if (this._buffer.length > 0 && !this._buffer[this._buffer.length - 1]) {
          this._buffer.pop();
        } else {
          done = true;
        }
      }
    }
  }

  /** @internal finds an opening log || undefined */
  findOpenLox(id: number) {
    if (isNumber(id)) {
      return this._shouldUseQueue
        ? this._pendingLoxQueue.find(item => item.type === 'open' && item?.id === id)
        : this._buffer.find(item => item?.id === id);
    } else {
      return undefined;
    }
  }

  /** @internal returns all defined open loxes */
  getOpenLoxes() {
    return filterDef(this._buffer);
  }

  /** @internal returns the open lox buffer with all open loxes or undefined */
  getBuffer() {
    return this._buffer;
  }

  /** @internal enqueues any lox to the pending queue */
  enqueue(log: Lox) {
    this._pendingLoxQueue.push(log);
  }

  /** @internal empties the pending queue and returns all pending loxes */
  dequeue() {
    const queue = this._pendingLoxQueue;
    this._pendingLoxQueue = [];
    this._shouldUseQueue = false;
    return queue;
  }
}
