declare type PrimitiveType = string | String | number | Number | BigInteger | boolean | Boolean | Function | ((...args: any[]) => any) | undefined | null;
declare type NonUndefined<T> = T extends undefined ? never : T;
declare type DeepResolvableUndefined<T> = {
    (fallback: NonUndefined<T>): NonUndefined<T>;
    (fallback?: undefined): T | undefined;
};
declare type DeepResolvableDefined<T> = {
    (): T;
};
declare type DeepResolvable<T, D extends boolean> = D extends true ? DeepResolvableUndefined<T> : undefined extends T ? DeepResolvableUndefined<T> : DeepResolvableDefined<T>;
interface DeepReadableAny extends DeepResolvable<any, true> {
    readonly [K: string]: DeepReadableAny;
}
declare type DeepReadableObject<T, P, D extends boolean> = {
    readonly [K in keyof NonNullable<T>]-?: DeepReadable<NonNullable<T>[K], P, undefined extends T ? true : null extends T ? true : D extends true ? true : false>;
};
interface DeepReadableArray<T, P, D extends boolean> {
    length: DeepReadable<number, P, D>;
    readonly [I: number]: DeepReadable<T, P, D>;
}
declare type DeepReadableType<T, TN, P, D extends boolean> = false extends (true & T) ? DeepReadableAny : TN extends P ? DeepResolvable<T, D> : TN extends Array<any> ? DeepReadableArray<TN[number], P, D> : TN extends object ? DeepReadableObject<T, P, D> : DeepResolvable<T, D>;
export declare type DeepReadable<T, P = PrimitiveType, D extends boolean = false> = DeepReadableType<T, NonNullable<T>, P, D> & DeepResolvable<T, D>;
/**
 * Produces a deeply null-coalescing handle to an object tree.
 *
 * A coalesced object is one which allows indefinitely deep nested property access without worrying about undefined or
 * null properties. The coalesced result will be undefined if any access in the series of reads is undefined or null.
 * Each level of nesting can be resolved without risk using simple property access, while the final access should be
 * applied as a function to get the coalesced result, with an optional fallback argument provided for when that value
 * is null or undefined.
 *
 * @param obj the object to coalesce.
 */
export declare function read<T, P = never>(obj: T): DeepReadable<T, PrimitiveType, undefined extends T ? true : false>;
export {};
