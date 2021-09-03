import { ANSI_CODE, Box, BoxLayouts, BoxLayoutStyle, getServiceColor } from '../ColorCode';
import { is } from '../Helpers';
import { LoxesType } from '../Loxer';
import { Lox } from '../loxes/Lox';
import { Modules } from './Modules';
import { OpenLoxBuffer } from './OpenLoxBuffer';

export class BoxFactory {
  private _modules: Modules;
  private _boxLayoutStyle: BoxLayoutStyle;

  constructor(modules?: Modules, boxLayoutStyle?: BoxLayoutStyle) {
    this._modules = modules ?? new Modules();
    this._boxLayoutStyle = boxLayoutStyle ?? 'round';
  }

  private getLoxColor(loxId: number | undefined, loxes: LoxesType): string {
    if (!is(loxId)) {
      return '';
    }
    const loxLog = loxes[loxId];
    if (!is(loxLog) || !is(loxLog?.moduleId)) {
      return '';
    }

    return this._modules.getColor(loxLog.moduleId);
  }

  getOpenLogBox(lox: Lox, loxes: LoxesType, openLoxBuffer: OpenLoxBuffer): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = this._modules.getColor(lox.moduleId);
    // print the depth before the start
    for (const openLoxId of openLoxBuffer.ids) {
      if (openLoxId === lox.id) {
        break;
      }
      box.push(
        openLoxId ? { box: 'vertical', color: this.getLoxColor(openLoxId, loxes) } : 'empty'
      );
    }
    // print the start of the box
    box.push({ box: 'openEdge', color });
    box.push({ box: 'openEnd', color });

    return box;
  }

  getOfLogBox(lox: Lox, loxes: LoxesType, openLoxBuffer: OpenLoxBuffer): Box {
    if (lox.moduleId === 'INVALID' || lox.moduleId === 'NONE') {
      return [];
    }
    const box: Box = [];
    const color = this._modules.getColor(lox.moduleId);
    let found = false;
    for (const id of openLoxBuffer.ids) {
      const itemColor = this.getLoxColor(id, loxes);
      if (!found) {
        if (id !== lox.id) {
          // print depth before occurrence
          box.push(id ? { box: 'vertical', color: itemColor } : 'empty');
        } else {
          // print occurrence
          box.push({ box: lox.type === 'close' ? 'closeEdge' : 'single', color });
          found = true;
        }
      } else {
        // print depth after occurrence
        box.push(id ? { box: 'cross', color: itemColor } : { box: 'horizontal', color });
      }
    }
    // print line end
    box.push({ box: lox.type === 'close' ? 'closeEnd' : 'horizontal', color });

    return box;
  }

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
