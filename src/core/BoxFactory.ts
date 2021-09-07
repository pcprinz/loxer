import { ANSI_CODE, Box, BoxLayouts, BoxLayoutStyle, getServiceColor } from '../ColorCode';
import { OutputLox } from '../loxes';
import { Loxes } from './Loxes';

/** @internal */
export class BoxFactory {
  private _boxLayoutStyle: BoxLayoutStyle;

  constructor(boxLayoutStyle?: BoxLayoutStyle) {
    this._boxLayoutStyle = boxLayoutStyle ?? 'round';
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
  getBoxString(box: Box, colored: boolean | undefined) {
    return (
      box
        .map(segment => {
          if (segment === 'empty') {
            return ' ';
          } else if (colored) {
            return (
              getServiceColor(segment.color) +
              BoxLayouts[this._boxLayoutStyle][segment.box] +
              ANSI_CODE.Reset
            );
          } else {
            return BoxLayouts[this._boxLayoutStyle][segment.box];
          }
        })
        .join('') + ' '
    );
  }
}
