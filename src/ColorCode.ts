import Color from 'color';

export interface BoxSymbol {
  openEnd: string;
  openEdge: string;
  vertical: string;
  horizontal: string;
  single: string;
  cross: string;
  closeEdge: string;
  closeEnd: string;
}
export type BoxSegment = { box: keyof BoxSymbol; color: string };
export type Box = (BoxSegment | 'empty')[];
export type BoxLayoutStyle = 'round' | 'light' | 'heavy' | 'double' | 'off';
export type BoxLayoutCollection = { [id in BoxLayoutStyle]: BoxSymbol };

// ANSI CODE

/** @internal */
export const ANSI_CODE = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',
};

/** @internal */
export const BoxLayouts: BoxLayoutCollection = {
  round: {
    openEnd: '\u2190',
    closeEnd: '\u2192',
    openEdge: '\u256d',
    closeEdge: '\u2570',
    vertical: '\u2502',
    horizontal: '\u2500',
    single: '\u251c',
    cross: '\u2506',
  },
  light: {
    openEnd: '\u2190',
    closeEnd: '\u2192',
    openEdge: '\u250c',
    closeEdge: '\u2514',
    vertical: '\u2502',
    horizontal: '\u2500',
    single: '\u251c',
    cross: '\u253c',
  },
  heavy: {
    openEnd: '\u2501',
    closeEnd: '\u2501',
    openEdge: '\u250f',
    closeEdge: '\u2517',
    vertical: '\u2503',
    horizontal: '\u2501',
    single: '\u2523',
    cross: '\u254B',
  },
  double: {
    openEnd: '\u2190',
    closeEnd: '\u2192',
    openEdge: '\u2553',
    closeEdge: '\u2559',
    vertical: '\u2551',
    horizontal: '\u2500',
    single: '\u255f',
    cross: '\u256b',
  },
  off: {
    openEnd: ' ',
    closeEnd: ' ',
    openEdge: ' ',
    closeEdge: ' ',
    vertical: ' ',
    horizontal: ' ',
    single: ' ',
    cross: ' ',
  },
};

// COLORING

/** @internal foreground color */
export function fCol(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r.toString()};${g.toString()};${b.toString()}m`;
}

/** @internal background color */
export function bCol(r: number, g: number, b: number): string {
  return `\x1b[48;2;${r.toString()};${g.toString()};${b.toString()}m`;
}

/** @internal */
export function highlightColor(text: string, color?: string): string {
  if (color) {
    const rgb = Color(color);

    return (
      bCol(Math.round(rgb.red()), Math.round(rgb.green()), Math.round(rgb.blue())) +
      text +
      ANSI_CODE.Reset
    );
  } else {
    return ANSI_CODE.Reverse + text + ANSI_CODE.Reset;
  }
}

/** @internal */
export function warnBackgroundColor(text: string): string {
  return bCol(255, 0, 0) + fCol(255, 255, 255) + text + ANSI_CODE.Reset;
}

/** @internal */
export function warnColor(text: string): string {
  return fCol(255, 0, 0) + text + ANSI_CODE.Reset;
}

/** @internal */
export function successColor(text: string): string {
  return fCol(20, 200, 0) + text + ANSI_CODE.Reset;
}

/** @internal */
export function timeColor(text: string): string {
  return fCol(70, 70, 70) + text + ANSI_CODE.Reset;
}

/** @internal */
export function closeLogColor(text: string): string {
  return fCol(180, 255, 180) + text + ANSI_CODE.Reset;
}

/** @internal */
export function getServiceColor(color: string, alpha: number = 1) {
  const rgb = Color(color && color.length > 0 ? color : '#fff');

  return fCol(
    Math.round(rgb.red() * alpha),
    Math.round(rgb.green() * alpha),
    Math.round(rgb.blue() * alpha)
  );
}
