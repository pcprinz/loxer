import { is } from '../Helpers';
import { Lox } from '../loxes/Lox';
import { LevelType, LoxerModules, LoxerOptions, Module } from '../types';

interface ModulesProps {
  dev: boolean;
  modules?: LoxerModules;
  moduleTextSlice?: number;
  defaultLevels?: LoxerOptions['defaultLevels'];
}

export type ExtendedModule = Module & { slicedName: string };

export class Modules {
  private _dev: boolean = false;
  private _modules: LoxerModules = DEFAULT_MODULES;
  private _moduleTextSlice: number = 8;

  constructor(props?: ModulesProps) {
    this._dev = props?.dev ?? true;
    if (props?.defaultLevels) {
      DEFAULT_MODULES.NONE.devLevel = props?.defaultLevels.devLevel;
      DEFAULT_MODULES.DEFAULT.devLevel = props?.defaultLevels.devLevel;
      DEFAULT_MODULES.NONE.prodLevel = props?.defaultLevels.prodLevel;
      DEFAULT_MODULES.DEFAULT.prodLevel = props?.defaultLevels.prodLevel;
    }
    this._modules = {
      ...DEFAULT_MODULES,
      ...props?.modules,
    };
    this._moduleTextSlice = props?.moduleTextSlice ?? 8;
  }

  ensureModule(moduleId: string): string {
    return this._modules[moduleId] === undefined ? 'INVALID' : moduleId;
  }

  /**
   * @internal the level of a specific module || -1
   */
  getLevel(moduleId: string): LevelType | -1 {
    const level = this._dev
      ? this._modules[moduleId]?.devLevel
      : this._modules[moduleId]?.prodLevel;

    return level ?? -1;
  }

  /** @deprecated */
  get(lox: Lox): ExtendedModule & { hidden: boolean } {
    let mod = this._modules[lox.moduleId];
    if (!is(mod)) {
      lox.moduleId = 'INVALID';
      mod = this._modules.INVALID;
    }
    let slicedName =
      mod.fullName.length > 0 ? `${mod.fullName.slice(0, this._moduleTextSlice)}: ` : '';
    const moduleTextLength = lox.moduleId === 'NONE' ? 0 : this._moduleTextSlice + 2;
    for (let i = slicedName.length; i < moduleTextLength; i++) {
      slicedName += ' ';
    }
    const dl = mod.devLevel ?? 1;
    const pl = mod.prodLevel ?? 1;
    const hidden = this._dev ? dl === 0 || lox.level > dl : pl === 0 || lox.level > pl;

    return {
      ...mod,
      hidden,
      slicedName,
    };
  }

  getModule(lox: Lox): { loxModule: ExtendedModule; hidden: boolean } {
    let mod = this._modules[lox.moduleId];
    if (!is(mod)) {
      lox.moduleId = 'INVALID';
      mod = this._modules.INVALID;
    }
    let slicedName =
      mod.fullName.length > 0 ? `${mod.fullName.slice(0, this._moduleTextSlice)}: ` : '';
    const moduleTextLength = lox.moduleId === 'NONE' ? 0 : this._moduleTextSlice + 2;
    for (let i = slicedName.length; i < moduleTextLength; i++) {
      slicedName += ' ';
    }
    const dl = mod.devLevel ?? 1;
    const pl = mod.prodLevel ?? 1;
    const hidden = this._dev ? dl === 0 || lox.level > dl : pl === 0 || lox.level > pl;

    return {
      loxModule: {
        ...mod,
        slicedName,
      },
      hidden,
    };
  }

  /**
   * @deprecated
   * @internal the texts of a specific module ||INVALID module
   */
  getText(lox: Lox): string {
    let module = this._modules[lox.moduleId];
    if (!is(module)) {
      lox.moduleId = 'INVALID';
      module = this._modules.INVALID;
    }
    let moduleText =
      module.fullName.length > 0 ? `${module.fullName.slice(0, this._moduleTextSlice)}: ` : '';
    const moduleTextLength = lox.moduleId === 'NONE' ? 0 : this._moduleTextSlice + 2;
    for (let i = moduleText.length; i < moduleTextLength; i++) {
      moduleText += ' ';
    }

    return moduleText;
  }

  /**
   * @deprecated
   * @internal the color of a specific module || ''
   */
  getColor(moduleId: string): string {
    const module = this._modules[moduleId];

    return is(module) && is(module.color) ? module.color : '';
  }

  /**
   * @deprecated
   * @internal determines if a log does not fulfill it's level constraints
   */
  isLogHidden(lox: Lox): boolean {
    const dl = this._modules[lox.moduleId]?.devLevel ?? 1;
    const pl = this._modules[lox.moduleId]?.prodLevel ?? 1;

    return this._dev ? dl === 0 || lox.level > dl : pl === 0 || lox.level > pl;
  }
}

/** @internal */
export const DEFAULT_MODULES: LoxerModules = {
  NONE: { fullName: '', color: '#fff', devLevel: 1, prodLevel: 0 },
  DEFAULT: { fullName: '', color: '#fff', devLevel: 1, prodLevel: 0 },
  INVALID: {
    fullName: 'INVALIDMODULE',
    color: '#f00',
    devLevel: 1,
    prodLevel: 0,
  },
};

export const DEFAULT_EXTENDED_MODULE: ExtendedModule = {
  fullName: 'INVALIDMODULE',
  color: '#f00',
  devLevel: 1,
  prodLevel: 0,
  slicedName: '',
};
