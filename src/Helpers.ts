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
    (typeof arg === 'function' || arg instanceof Error || arg instanceof Function) &&
    isString(arg.name) &&
    isString(arg.message)
  );
}

/** @internal */
export function ensureError(error: Error | string | number | boolean | object): Error {
  let result;
  if (isError(error)) {
    result = error;
    result.stack = result.stack ? eraseBeginningLines(result.stack, 1) : undefined;
  } else {
    if (typeof error === 'object') {
      result = new Error(JSON.stringify(error));
    } else {
      result = new Error(error.toString());
    }
    result.stack = result.stack ? eraseBeginningLines(result.stack, 4) : undefined;
  }

  return result;
}

/** @internal */
export function eraseBeginningLines(message: string, count: number) {
  let position = 0;
  do {
    position = message.indexOf('\n', position + 1);
    count--;
  } while (count > 0);

  return message.slice(position);
}

/** @internal */
export class LoxerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'LoxerError';
  }
}
