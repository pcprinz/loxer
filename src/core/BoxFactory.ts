import { BoxLayouts, BoxLayoutStyle, BoxSymbols } from './BoxFormat';
import { ANSIFormat } from './ANSIFormat';
import { Loxes } from './Loxes';
import { OutputLox } from '../loxes/OutputLox';
export type Box = (BoxSegment | 'empty')[];
export type BoxSegment = { box: keyof BoxSymbols; color: string };
/** @internal */
export class BoxFactory {
  private _boxLayoutStyle: BoxLayoutStyle;

  constructor(boxLayoutStyle?: BoxLayoutStyle) {
    this._boxLayoutStyle = boxLayoutStyle ?? 'round';
  }

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

  /** @internal */
  getBoxString(box: Box, colored: boolean | undefined): string {
    return (
      box
        .map((segment) => {
          if (segment === 'empty') {
            return ' ';
          } else if (colored) {
            return ANSIFormat.colorize(
              BoxLayouts[this._boxLayoutStyle][segment.box],
              segment.color
            );
          } else {
            return BoxLayouts[this._boxLayoutStyle][segment.box];
          }
        })
        .join('') + ' '
    );
  }
}
