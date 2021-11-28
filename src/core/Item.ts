/**
 * - array
 * - number
 * - string
 * - boolean
 * - symbol
 * - bigint
 * - object
 * - function
 * - null / undefined
 */

import { ANSIFormat } from '..';

export type ItemType = any;

export interface ItemOptions {
  depth?: number;
  printFunction?: boolean;
  colored?: boolean;
  indent?: number;
  showVerticalLines?: boolean;
}

export class Item {
  private _item: ItemType;
  private _depth: number;
  private _printFunction: boolean;
  private _indent: number;
  private _showVerticalLines: boolean;

  constructor(item: ItemType, options?: ItemOptions) {
    this._item = item;
    this._depth = options?.depth ?? 0;
    this._printFunction = options?.printFunction ?? false;
    this._indent = options?.indent ?? 2;
    this._showVerticalLines =
      options?.showVerticalLines !== undefined ? options.showVerticalLines : false;
  }

  get item(): ItemType {
    return this._item;
  }

  prettify(colored: boolean = true): string {
    return `\n${this.prettifyItem(this._item)[colored ? 0 : 1]}`;
  }

  private prettifyItem(item: ItemType, depth: number = 0): [colored: string, plain: string] {
    if (item === null) {
      return this.printUndefined(item);
    }

    if (Array.isArray(item)) {
      if (this._depth > 0 && depth >= this._depth) {
        return [`[ ${ANSIFormat.fgUndefined('...')} ]`, '[ ... ]'];
      }

      return this.printArray(item, depth);
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
        if (this._depth > 0 && depth >= this._depth) {
          return [`{ ${ANSIFormat.fgUndefined('...')} }`, '{ ... }'];
        }

        return this.printObject(item, depth);
      default:
        return this.printDefault(item);
    }
  }

  private printDefault(item: any): [colored: string, plain: string] {
    const value = JSON.stringify(item);

    return [ANSIFormat.fgTime(value), value];
  }

  private printNum(item: number): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgNumber(value), value];
  }

  private printBigint(item: bigint): [colored: string, plain: string] {
    const value = `${item.toString()}n`;

    return [ANSIFormat.fgNumber(value), value];
  }

  private printSymbol(item: symbol): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgString(value), value];
  }

  private printString(item: string): [colored: string, plain: string] {
    const value = `'${item}'`;

    return [ANSIFormat.fgString(value), value];
  }

  private printBoolean(item: boolean): [colored: string, plain: string] {
    const value = item.toString();

    return [ANSIFormat.fgBoolean(value), value];
  }

  private printUndefined(item: undefined | null): [colored: string, plain: string] {
    const value = item === undefined ? 'undefined' : 'null';

    return [ANSIFormat.fgUndefined(value), value];
  }

  private printFunction(item: FunctionConstructor): [colored: string, plain: string] {
    const fText = item.name ? `: ${item.name}` : ' (anonymous)';
    const value = this._printFunction ? item.toString() : `[Function${fText}]`;

    return [ANSIFormat.fgFunction(value), value];
  }

  private printArray(items: any[], depth: number = 0): [colored: string, plain: string] {
    const prettified = items.map((item) => this.prettifyItem(item, depth + 1));
    const short = prettified.map((item) => item[1]).join(', ');

    // return short array
    if (short.length < 70) {
      const shortColored = prettified.map((item) => item[0]).join(', ');

      return [`[ ${shortColored} ]`, `[ ${short} ]`];
    }

    // return expanded array
    const expanded = prettified
      .map((item) => this.indentString(depth + 1, false) + item[1])
      .join(',\n');
    const expandedColored = prettified
      .map((item) => this.indentString(depth + 1) + item[0])
      .join(',\n');

    return [
      `[\n${expandedColored}\n${this.indentString(depth)}]`,
      `[\n${expanded}\n${this.indentString(depth, false)}]`,
    ];
  }

  private printObject(
    record: Record<string, unknown>,
    depth: number
  ): [colored: string, plain: string] {
    const prettified: [colored: string, plain: string][] = Object.entries(record).map(
      ([key, value]) => {
        const pretty = this.prettifyItem(value, depth + 1);

        return [`${key}: ${pretty[0]}`, `${key}: ${pretty[1]}`];
      }
    );
    const short = prettified.map((item) => item[1]).join(', ');

    if (short.length < 70) {
      const shortColored = prettified.map((item) => item[0]).join(', ');

      return [`{ ${shortColored} }`, `{ ${short} }`];
    }

    // return expanded array
    const expanded = prettified
      .map((item) => this.indentString(depth + 1, false) + item[1])
      .join(',\n');
    const expandedColored = prettified
      .map((item) => this.indentString(depth + 1) + item[0])
      .join(',\n');

    return [
      `{\n${expandedColored}\n${this.indentString(depth)}}`,
      `{\n${expanded}\n${this.indentString(depth, false)}}`,
    ];
  }

  private indentString(depth: number = 0, colored: boolean = true) {
    const line = colored ? ANSIFormat.fgLine('┊') : '┊';
    const spaces = Array(depth * this._indent).fill(' ');

    return this._showVerticalLines
      ? spaces.map((_, index) => (index % this._indent === 0 ? line : ' ')).join('')
      : spaces.join('');
  }
}
