import {filterDef} from '../Helpers';
import { Lox } from '../loxes/Lox';

export class OpenLoxBuffer {
  private _buffer: (number | undefined)[] = [];
  add(log: Lox) {
    if (log.type === 'open') {
      this._buffer.push(log.id);
    }
  }
  remove(log: Lox) {
    if (log.type === 'close') {
      const index = this._buffer.indexOf(log.id);
      if (index > -1) {
        this._buffer[index] = undefined;
      }
      // remove undefined buffer end
      let done = false;
      while (!done) {
        if (
          this._buffer.length > 0 &&
          !this._buffer[this._buffer.length - 1]
        ) {
          this._buffer.pop();
        } else {
          done = true;
        }
      }
    }
  }

  get ids() {
      return this._buffer;
  }

  get definedIds(): number[] {
      return filterDef(this._buffer);
  }
}
