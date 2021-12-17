import { OutputLox } from '../loxes/OutputLox';
import { ANSIFormat } from './ANSIFormat';
import { BoxLayouts, BoxLayoutStyle, BoxSymbols } from './BoxFormat';
import { Loxes } from './Loxes';

export type Box = (BoxSegment | 'empty')[];

export type BoxSegment = { box: keyof BoxSymbols; color: string; boxLayout: BoxLayoutStyle };

/** A Factory used to construct the BoxLayout for `*Lox`es */
export class BoxFactory {
  /** @internal */
  static getLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.hidden) {
      return [];
    }

    return lox.type === 'open' ? this.getOpenLogBox(lox, loxes) : this.getOfLogBox(lox, loxes);
  }

  /** @internal */
  static getOpenLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    // print the depth before the start
    for (const bufferLox of loxes.getBuffer()) {
      if (lox.id === bufferLox?.id) {
        break;
      }
      box.push(
        bufferLox
          ? {
              box: 'vertical',
              color: bufferLox.module.color,
              boxLayout: bufferLox.module.boxLayoutStyle,
            }
          : 'empty'
      );
    }
    // print the start of the box
    box.push({ box: 'openEdge', color: lox.module.color, boxLayout: lox.module.boxLayoutStyle });
    box.push({ box: 'openEnd', color: lox.module.color, boxLayout: lox.module.boxLayoutStyle });

    return box;
  }

  /** @internal */
  static getOfLogBox(lox: OutputLox, loxes: Loxes): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = lox.module.color;
    let found = false;
    for (const bufferLox of loxes.getBuffer()) {
      const itemColor = bufferLox?.module.color ?? '';
      const boxLayout = bufferLox?.module.boxLayoutStyle ?? 'round';
      if (!found) {
        if (lox.id === bufferLox?.id) {
          // print occurrence
          box.push({ box: lox.type === 'close' ? 'closeEdge' : 'single', color, boxLayout });
          found = true;
        } else {
          // print depth before occurrence
          box.push(bufferLox ? { box: 'vertical', color: itemColor, boxLayout } : 'empty');
        }
      } else {
        // print depth after occurrence
        box.push(
          bufferLox
            ? { box: 'cross', color: itemColor, boxLayout }
            : { box: 'horizontal', color, boxLayout }
        );
      }
    }
    // print line end
    box.push({
      box: lox.type === 'close' ? 'closeEnd' : 'horizontal',
      color,
      boxLayout: lox.module.boxLayoutStyle,
    });

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
  static getBoxString(box: Box, colored: boolean | undefined): string {
    const result = box
      .map((segment) => {
        if (segment === 'empty') {
          return ' ';
        }
        if (colored) {
          return ANSIFormat.colorize(BoxLayouts[segment.boxLayout][segment.box], segment.color);
        }

        return BoxLayouts[segment.boxLayout][segment.box];
      })
      .join('');

    return result.length > 0 ? `${result} ` : result;
  }
}
