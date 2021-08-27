import {Loxer} from '../Loxer';
import {LoxerOptions} from '../types';

/**
 * This class decorator initializes the Loxer immediately when the before the class is used.
 * Use this if the initialization has to be done fast.
 *
 * ---
 * @param options the options for the `Loxer.init(options: LoxerOptions)` method
 * @returns a class decorator
 */

export function initLoxer(options: LoxerOptions) {
  Loxer.init(options);
}
