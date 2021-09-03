import { ANSI_CODE, getServiceColor } from '../ColorCode';
import { DEFAULT_MODULES, is } from '../Helpers';
import { Lox } from '../loxes/Lox';
import { LoxerModules, LoxerOptions } from '../types';

interface ModulesProps {
  dev: boolean;
  modules?: LoxerModules;
  endTitleOpacity?: number;
  moduleTextSlice?: number;
  defaultLevels?: LoxerOptions['defaultLevels']
}

export class Modules {
  private _dev: boolean = false;
  private _modules: LoxerModules = DEFAULT_MODULES;
  private _moduleTextSlice: number = 8;
  private _endTitleOpacity: number = 0;

  constructor(props?: ModulesProps) {
    this._dev = props?.dev ?? true;    
    if (props?.defaultLevels) {
      DEFAULT_MODULES['NONE'].develLevel = props?.defaultLevels.develLevel;
      DEFAULT_MODULES['DEFAULT'].develLevel = props?.defaultLevels.develLevel;
      DEFAULT_MODULES['NONE'].prodLevel = props?.defaultLevels.prodLevel;
      DEFAULT_MODULES['DEFAULT'].prodLevel = props?.defaultLevels.prodLevel;
    }
    this._modules = {
      ...DEFAULT_MODULES,
      ...props?.modules,
    };
    this._moduleTextSlice = props?.moduleTextSlice ?? 8;
    this._endTitleOpacity = props?.endTitleOpacity ?? 0;

  }

  getLevel(moduleId: string) {
    const level = this._dev
      ? this._modules[moduleId]?.develLevel
      : this._modules[moduleId]?.prodLevel;

    return level ?? -1;
  }

  getText(lox: Lox) {
    let module = this._modules[lox.moduleId];
    if (!is(module)) {
      lox.moduleId = 'INVALID';
      module = this._modules.INVALID;
    }
    const opacity = lox.type !== 'close' ? 1 : this._endTitleOpacity ?? 0;
    let moduleText =
      module.fullname.length > 0 && opacity > 0
        ? module.fullname.slice(0, this._moduleTextSlice) + ': '
        : '';
    const moduleTextLength = lox.moduleId === 'NONE' ? 0 : this._moduleTextSlice + 2;
    for (let i = moduleText.length; i < moduleTextLength; i++) {
      moduleText += ' ';
    }
    const coloredModuleText = module
      ? getServiceColor(module.color, opacity) + moduleText + ANSI_CODE.Reset
      : moduleText;

    return { moduleText, coloredModuleText };
  }

  getColor(moduleId: string): string {
    const module = this._modules[moduleId];

    return is(module) && is(module.color) ? module.color : '';
  }
  isLogHidden(lox: Lox): boolean {
    const dl = this._modules[lox.moduleId]?.develLevel ?? 1;
    const pl = this._modules[lox.moduleId]?.prodLevel ?? 1;

    return this._dev ? dl === 0 || lox.level > dl : pl === 0 || lox.level > pl;
  }
}
