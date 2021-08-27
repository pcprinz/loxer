import { is } from './Helpers';
import { Loxer } from './Loxer';
import { LogLevelType, LoxerOptions } from './types';

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

/**
 * The Options for the `@trace(options: TracerOptions | string)` decorator
 */
interface TraceOptions {
    /** the corresponding key of a `LoxerModule` provided in the `LoxerOptions.modules` for the `Loxer.init(options: LoxerOptions)` initialization */
    moduleId?: string;
    /** the level of the log. defaults to `1` */
    level?: LogLevelType;
    /** which messages should be highlighted */
    highlight?: 'open' | 'close' | 'all';
    /** how should the opening message be styled. for example if `MyServiceClass.myFunction(a: number, b: string)`
     * is called with `myFunction(3, "test")`:
     * - `'functionName'`: prints `"myFunction()"`
     * - `'className.functionName'`: prints `"MyService.myFunction()"` (the postfix `Class` will be erased though it
     *   is clear that it's a class, when a method is decorated)
     * - `'types'`: prints `"myFunction(number, string)"` (with the types of the actual arguments)
     * - `'args'`: prints `"myFunction(3, "test")"` (with the actual arguments)
     * - `(args: any[]) => string)` is a callback which provides the actual arguments.
     * - defaults to `'functionName'`
     */
    openMessage?: ((args: any[]) => string) | 'functionName' | 'className.functionName' | 'types' | 'args';
    /** how should the opening message be styled. for example if `MyServiceClass.myFunction(a: number, b: string)`
     * returns `{val: "test", count: 5}`:
     * - `'functionName'`: prints `"myFunction done"`
     * - `'className.functionName'`: prints `"MyService.myFunction done"` (the postfix `Class` will be erased though it
     *   is clear that it's a class, when a method is decorated)
     * - `'result'`: prints `"myFunction done. returns: {val: "test", count: 5}"`
     * - `'prettyResult'`: prints:
     *   ```string
     *   myFunction done. returns:
     *   {
     *       val: "test",
     *       count: 5
     *   }
     *   ```
     * - `(result?: any) => string)` is a callback which provides the actual result.
     * - defaults to `'functionName'`
     */
    closeMessage?: ((result?: any) => string) | 'functionName' | 'className.functionName' | 'result' | 'prettyResult';
    /** appends the arguments as `item: any` to the open log.
     * - defaults to `false`
     */
    argsAsItem?: boolean;
    /** appends the result as `item: any` to the close log.
     * - defaults to `false`
     */
    resultAsItem?: boolean;
}

/**
 * This decorator wraps a class level method inside a `Loxer.open()` and a `Loxer.of(...).close()` box.
 *
 * ---
 * @param options either a `string` for the `moduleId` or an `object` of type `TraceOptions`
 * @returns a Decorator for class level methods
 */
export function trace(options?: TraceOptions | string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        const className: string = target.constructor.name;
        const fixedName = className.endsWith('Class') ? className.substr(0, className.length - 5) : className;
        descriptor.value = async function (...args: any[]) {
            let moduleId;
            let o;
            if (is(options) && typeof options === 'string') {
                moduleId = options;
            } else if (is(options)) {
                o = options;
                moduleId = o?.moduleId;
            }

            const level = o?.level ?? 1;
            const h = o?.highlight;

            // open message
            let openMessage = getOpenMessage(o, propertyKey, args, fixedName);

            // open the lox
            const item = o?.argsAsItem ? args : undefined;
            const loxId = Loxer.h(h === 'all' || h === 'open')
                .l(level)
                .m(moduleId)
                .open(openMessage, item);

            // call the function
            const result = await original.call(this, ...args);

            // close message
            let closeMessage = getCloseMessage(o, propertyKey, result, fixedName);

            // close the lox
            const resultItem = o?.resultAsItem ? result : undefined;
            Loxer.h(h === 'all' || h === 'close')
                .of(loxId)
                .close(closeMessage, resultItem);

            return result;
        };
    };
}

function getOpenMessage(o: TraceOptions | undefined, propertyKey: string, args: any[], fixedName: string) {
    const om = o?.openMessage;
    let openMessage = propertyKey + '()';
    if (is(om)) {
        if (typeof om === 'function') {
            openMessage = om(args);
        } else if (om === 'args') {
            openMessage = propertyKey + '(' + args.join(', ') + ')';
        } else if (om === 'types') {
            openMessage = propertyKey + '(' + args.map((a) => typeof a).join(', ') + ')';
        } else if (om === 'className.functionName') {
            openMessage = fixedName + '.' + propertyKey + '()';
        }
    }
    return openMessage;
}

function getCloseMessage(o: TraceOptions | undefined, propertyKey: string, result: any, fixedName: string) {
    const cm = o?.closeMessage;
    let closeMessage = propertyKey + ' done';
    if (is(cm)) {
        if (typeof cm === 'function') {
            closeMessage = cm(result);
        } else if (cm === 'result') {
            closeMessage = propertyKey + ' done. returns: ' + JSON.stringify(result);
        } else if (cm === 'prettyResult') {
            closeMessage = propertyKey + ' done. returns: \n' + JSON.stringify(result, null, ' ');
        } else if (cm === 'className.functionName') {
            closeMessage = fixedName + '.' + propertyKey + ' done';
        }
    }
    return closeMessage;
}
