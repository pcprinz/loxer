/** @internal is not undefined or null */
export function is<T extends any>(arg: T | undefined | null): arg is T {
  return arg != null;
}

/** @internal */
export function isString(arg: unknown): arg is string {
  return is(arg) && typeof arg === 'string';
}

/** @internal is a defined, non empty string */
export function isNES(arg: unknown): arg is string {
  return isString(arg) && arg.length > 0;
}

/** @internal is a valid defined number */
export function isNumber(arg: unknown): arg is number {
  return is(arg) && typeof arg === 'number' && !isNaN(arg);
}
/** @internal filters a list after it's defined values (typed) */
export function filterDef<T extends any>(list: (T | undefined)[]): T[] {
  return list.filter((element) => is(element)) as T[];
}

/** @internal */
export function isError(arg: unknown): arg is Error {
  return is(arg) && arg instanceof Error && isString(arg.name) && isString(arg.message);
}

/** @internal */
export function eraseBeginningLines(message: string, count: number): string {
  let position = 0;
  do {
    position = message.indexOf('\n', position + 1);
    count--;
  } while (count > 0);

  return message.slice(position);
}
