import { LoxerModules } from './types';

/** @internal is not undefined or null */
export function is<T extends any>(arg: T | undefined | null): arg is T {
  return arg !== undefined && arg !== null;
}

/** @internal */
export function isString(arg: any): arg is string {
  return is(arg) && typeof arg === 'string';
}

/** @internal is a defined, non empty string */
export function isNES(arg: any): arg is string {
  return isString(arg) && arg.length > 0;
}

/** @internal is a valid defined number */
export function isNumber(arg: any): arg is number {
  return is(arg) && typeof arg === 'number' && !isNaN(arg);
}
/** @internal filters a list after it's defined values (typed) */
export function filterDef<T extends any>(list: (T | undefined)[]): T[] {
  return list.filter(element => is(element)) as T[];
}

/** @internal */
export function isError(arg: any): arg is Error {
  return (
    is(arg) &&
    (typeof arg === 'function' ||
      arg instanceof Error ||
      arg instanceof Function) &&
    isString(arg.name) &&
    isString(arg.message)
  );
}

/** @internal */
export function ensureError(
  error: Error | string | number | boolean | object,
  addition?: string
): Error {
  if (isError(error)) {
    const message = error.message;
    error.message = addition ? addition + message : message;

    return error;
  } else {
    const message = (addition ? addition : '') + error.toString();

    return new Error(message);
  }
}

/** @internal */
export class LoxerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'LoxerError';
  }
}

/** @internal */
export const DEFAULT_MODULES: LoxerModules = {
  NONE: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 1 },
  DEFAULT: { fullname: '', color: '#fff', develLevel: 1, prodLevel: 1 },
  INVALID: {
    fullname: 'INVALIDMODULE',
    color: '#f00',
    develLevel: 1,
    prodLevel: 0,
  },
};
