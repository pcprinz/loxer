import { Lox } from '../loxes/Lox';
import { ANSIFormat } from './ANSIFormat';

/** any primitive and non primitive type that an `Item`can be composed of */
export type ItemType =
  | number
  | bigint
  | symbol
  | string
  | boolean
  | Record<string, unknown>
  | any[]
  | (() => any)
  | null
  | undefined;

/** the options to configure the "default" output of the item */
export interface ItemOptions {
  /** at which object / array depth, other objects / arrays should just be displayed as their type + length. defaults to `infinity` */
  depth?: number;
  /** should a function be printed with its complete declaration. defaults to `false` */
  printFunction?: boolean;
  /** the indent that nested objects / arrays have (when not shortened to 1 line). defaults to `2` */
  indent?: number;
  /** should vertical indent indicator lines be printed. defaults to `true` */
  showVerticalLines?: boolean;
  /** filtered keys for objects.
   * - helpful for larger objects
   * - other keys will not be displayed
   * - objects and arrays that deeply contain the given keys will have an indicator of how many elements where left out
   */
  keys?: string[];
}

/** A helper class that can be used to pretty print **items** of `Lox`es */
export class Item {
  private _item: ItemType;
  private _depth: number;
  private _printFunction: boolean;
  private _indent: number;
  private _showVerticalLines: boolean;
  private _keys: string[] | undefined;

  /**
   * @internal
   * @param lox to pretty print the item of
   */
  private constructor(lox: Lox) {
    this._item = lox.item;
    this._depth = lox.itemOptions?.depth ?? 0;
    this._printFunction = lox.itemOptions?.printFunction ?? false;
    this._indent = lox.itemOptions?.indent ?? 2;
    this._showVerticalLines =
      lox.itemOptions?.showVerticalLines !== undefined ? lox.itemOptions.showVerticalLines : true;
    this._keys = lox.itemOptions?.keys;
  }

  /**
   * @param lox to pretty print the item for
   * @returns a chained function `prettify(...)` to pretty print the lox
   */
  static of(lox: Lox): Item {
    return new Item(lox);
  }

  /**
   * prettifies the output of a Lox' item - similar to what the `console` methods do, but with some improvements:
   * - the depth of objects / arrays is not bound to 3
   * - the indent is configurable
   * - indent is shown with vertical indicator lines
   * - objects can be filtered to specific keys (helpful when dealing with large items)
   *
   * @param colored should the output be colored (with ANSI colors)
   * @param box options for the box surrounding the printed item
   * @returns a pretty string of the item
   */
  public prettify(
    colored: boolean = true,
    box?: {
      /** the vertical depth, where the box starts / ends (typically the column of the log's box) */
      depth: number;
      /** color of the box and surrounding text (typically the color of the log's box) */
      color: string;
    }
  ): string {
    if (box) {
      const pre = ANSIFormat.colorize(
        '\n┌' +
          Array(box.depth - 1)
            .fill('─')
            .join('') +
          '┘ item>\n│',
        box.color
      );
      const post = ANSIFormat.colorize(
        '\n└' +
          Array(box.depth - 1)
            .fill('─')
            .join('') +
          '┐ <end',
        box.color
      );

      return (
        pre + this.prettifyItem(this._item, undefined, undefined, box.color)[colored ? 0 : 1] + post
      );
    }

    return (
      '\n┌───────────────────────────────' +
      `\n┃${this.prettifyItem(this._item)[colored ? 0 : 1]}` +
      '\n└───────────────────────────────'
    );
  }

  /** @internal */
  private prettifyItem(
    item: ItemType,
    depth: number = 0,
    save: boolean = false,
    boxColor?: string
  ): [colored: string, plain: string] {
    if (item === null) {
      return this.printUndefined(item);
    }

    if (Array.isArray(item)) {
      if (this._depth > 0 && depth >= this._depth) {
        return [ANSIFormat.fgUndefined(`[${item.length} elements]`), `[${item.length} elements]`];
      }

      return this.printArray(item, depth, save, boxColor);
    }

    switch (typeof item) {
      case 'number':
        return this.printNum(item);
      case 'bigint':
        return this.printBigint(item);
      case 'symbol':
        return this.printSymbol(item);
      case 'string':
        return this.printString(item);
      case 'boolean':
        return this.printBoolean(item);
      case 'undefined':
        return this.printUndefined(item);
      case 'function':
        return this.printFunction(item);
      case 'object':
        if (item instanceof Date) {
          return this.printDate(item);
        }
        if (this._depth > 0 && depth >= this._depth) {
          return [
            ANSIFormat.fgUndefined(`{${Object.keys(item).length} entries}`),
            `{${Object.keys(item).length} entries}`,
          ];
        }

        return this.printObject(item, depth, save, boxColor);
      default:
        return this.printDefault(item);
    }
  }

  /** @internal */
  private printDefault(item: any): [colored: string, plain: string] {
    const value = JSON.stringify(item);

    return [ANSIFormat.fgTime(value), value];
  }

  /** @internal */
  private printNum(item: number): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgNumber(value), value];
  }

  /** @internal */
  private printBigint(item: bigint): [colored: string, plain: string] {
    const value = `${item.toString()}n`;

    return [ANSIFormat.fgNumber(value), value];
  }

  /** @internal */
  private printSymbol(item: symbol): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgString(value), value];
  }

  /** @internal */
  private printString(item: string): [colored: string, plain: string] {
    const value = `'${item}'`;

    return [ANSIFormat.fgString(value), value];
  }

  /** @internal */
  private printBoolean(item: boolean): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgBoolean(value), value];
  }

  /** @internal */
  private printDate(item: Date): [colored: string, plain: string] {
    const value = item.toISOString();

    return [ANSIFormat.fgDate(value), value];
  }

  /** @internal */
  private printUndefined(item: undefined | null): [colored: string, plain: string] {
    const value = item === undefined ? 'undefined' : 'null';

    return [ANSIFormat.fgUndefined(value), value];
  }

  /** @internal */
  private printFunction(item: () => any): [colored: string, plain: string] {
    const fText = item.name ? `: ${item.name}` : ' (anonymous)';
    const value = this._printFunction ? item.toString() : `[Function${fText}]`;

    return [ANSIFormat.fgFunction(value), value];
  }

  /** @internal */
  private printArray(
    items: any[],
    depth: number = 0,
    save: boolean = false,
    boxColor?: string
  ): [colored: string, plain: string] {
    const prettified = items
      .filter(
        (item) =>
          !this._keys || save || (typeof item === 'object' && item != null) || Array.isArray(item)
      )
      .map((item) => this.prettifyItem(item, depth + 1, save, boxColor))
      .filter(
        (pretty) => !this._keys || (!pretty[1].startsWith('[...') && !pretty[1].startsWith('{...'))
      );

    // filtered empty
    const cut = items.length - prettified.length;
    if (prettified.length === 0 && cut > 0) {
      return [ANSIFormat.fgUndefined('[...]'), '[...]'];
    }

    // add symbol for cut keys
    if (cut > 0) {
      prettified.push([ANSIFormat.fgUndefined(`+(${cut} elements)`), `+(${cut} elements)`]);
    }

    // return short array
    const short = prettified.map((item) => item[1]).join(', ');
    if (short.length < 70) {
      const shortColored = prettified.map((item) => item[0]).join(', ');

      return [`[ ${shortColored} ]`, `[ ${short} ]`];
    }

    // return expanded array
    const expanded = prettified
      .map((item) => this.indentString(depth + 1, false, boxColor) + item[1])
      .join(',\n');
    const expandedColored = prettified
      .map((item) => this.indentString(depth + 1, true, boxColor) + item[0])
      .join(',\n');

    return [
      `[\n${expandedColored}\n${this.indentString(depth, true, boxColor)}]`,
      `[\n${expanded}\n${this.indentString(depth, false, boxColor)}]`,
    ];
  }

  /** @internal */
  private printObject(
    record: Record<string, any>,
    depth: number,
    save: boolean = false,
    boxColor?: string
  ): [colored: string, plain: string] {
    const prettified = Object.entries(record)
      .filter(
        ([key, value]) =>
          !this._keys ||
          save ||
          typeof value === 'object' ||
          Array.isArray(value) ||
          this._keys.includes(key)
      )
      .map(([key, value]) => {
        const pretty = this.prettifyItem(
          value,
          depth + 1,
          save || this._keys?.includes(key),
          boxColor
        );
        const unColored =
          !pretty[1].startsWith('[...') && !pretty[1].startsWith('{...')
            ? `${key}: ${pretty[1]}`
            : '{...}';
        const coloredKey = this._keys?.includes(key)
          ? ANSIFormat.colorHighlight(`${key}:`)
          : `${key}:`;

        return [`${coloredKey} ${pretty[0]}`, unColored];
      })
      .filter(
        (pretty) => !this._keys || (!pretty[1].startsWith('[...') && !pretty[1].startsWith('{...'))
      );

    // filtered empty
    const cut = Object.keys(record).length - prettified.length;
    if (prettified.length === 0 && cut > 0) {
      return [ANSIFormat.fgUndefined('{...}'), '{...}'];
    }

    // add symbol for cut keys
    if (cut > 0) {
      prettified.push([ANSIFormat.fgUndefined(`+(${cut} entries)`), `+(${cut} entries)`]);
    }

    // return short object
    const short = prettified.map((item) => item[1]).join(', ');
    if (short.length < 70) {
      const shortColored = prettified.map((item) => item[0]).join(', ');

      return [`{ ${shortColored} }`, `{ ${short} }`];
    }

    // return expanded object
    const expanded = prettified
      .map((item) => this.indentString(depth + 1, false, boxColor) + item[1])
      .join(',\n');
    const expandedColored = prettified
      .map((item) => this.indentString(depth + 1, true, boxColor) + item[0])
      .join(',\n');

    return [
      `{\n${expandedColored}\n${this.indentString(depth, true, boxColor)}}`,
      `{\n${expanded}\n${this.indentString(depth, false, boxColor)}}`,
    ];
  }

  /** @internal returns a specified string of spaces (and vertical indent indicators) */
  private indentString(depth: number = 0, colored: boolean = true, boxColor?: string) {
    const line = colored ? ANSIFormat.fgLine('┊') : '┊';
    const spaces = Array(depth * this._indent).fill(' ');
    const box = boxColor ? ANSIFormat.colorize('┃', boxColor) : '┃';
    const indent = this._showVerticalLines
      ? spaces.map((_, index) => (index % this._indent === 0 ? line : ' ')).join('')
      : spaces.join('');

    return box + indent;
  }
}
