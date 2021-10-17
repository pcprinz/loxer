import { BoxLayouts, BoxLayoutStyle, BoxSymbols } from './BoxFormat';
import { ANSIFormat } from './ANSIFormat';
import { Loxes } from './Loxes';
import { OutputLox } from '../loxes/OutputLox';

export type Box = (BoxSegment | 'empty')[];

export type BoxSegment = { box: keyof BoxSymbols; color: string };

/** A Factory used to construct the BoxLayout for `*Lox`es */
export class BoxFactory {
  private _boxLayoutStyle: BoxLayoutStyle;

  /**
   * @param boxLayoutStyle The style of the used unicode symbols: `"round" | "light" | "heavy" | "double" | "off"`
   */
  constructor(boxLayoutStyle?: BoxLayoutStyle) {
    this._boxLayoutStyle = boxLayoutStyle ?? 'round';
  }

  /** @internal */
  getLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.hidden) {
      return [];
    }

    return lox.type === 'open' ? this.getOpenLogBox(lox, loxes) : this.getOfLogBox(lox, loxes);
  }

  /** @internal */
  getOpenLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    // print the depth before the start
    for (const bufferLox of loxes.getBuffer()) {
      if (lox.id === bufferLox?.id) {
        break;
      }
      box.push(bufferLox ? { box: 'vertical', color: bufferLox.color } : 'empty');
    }
    // print the start of the box
    box.push({ box: 'openEdge', color: lox.color });
    box.push({ box: 'openEnd', color: lox.color });

    return box;
  }

  /** @internal */
  getOfLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = lox.color;
    let found = false;
    for (const bufferLox of loxes.getBuffer()) {
      const itemColor = bufferLox?.color ?? '';
      if (!found) {
        if (lox.id === bufferLox?.id) {
          // print occurrence
          box.push({ box: lox.type === 'close' ? 'closeEdge' : 'single', color });
          found = true;
        } else {
          // print depth before occurrence
          box.push(bufferLox ? { box: 'vertical', color: itemColor } : 'empty');
        }
      } else {
        // print depth after occurrence
        box.push(bufferLox ? { box: 'cross', color: itemColor } : { box: 'horizontal', color });
      }
    }
    // print line end
    box.push({ box: lox.type === 'close' ? 'closeEnd' : 'horizontal', color });

    return box;
  }

  /**
   * Creates a string version of the given `*Lox` box.
   *
   * ## Single Usage
   * ```typescript
   * const lox: OutputLox = ... // the lox in an output callback (also `ErrorLox`)
   * const stringBox = new BoxFactory().getBoxString(lox.box, true);
   *
   * // or with a different layout (than 'round')
   * const otherBox = new BoxFactory('light').getBoxString(lox.box, true);
   * ```
   * @param box the `Box` of an `OutputLox` or `ErrorLox`
   * @param colored should the symbols be wrapped in ANSI colors
   * @returns a stringified version of the given box
   */
  getBoxString(box: Box, colored: boolean | undefined): string {
    const result = box
      .map((segment) => {
        if (segment === 'empty') {
          return ' ';
        }
        if (colored) {
          return ANSIFormat.colorize(BoxLayouts[this._boxLayoutStyle][segment.box], segment.color);
        }

        return BoxLayouts[this._boxLayoutStyle][segment.box];
      })
      .join('');

    return result.length > 0 ? `${result} ` : result;
  }
}
