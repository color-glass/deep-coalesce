declare type PrimitiveType = string | String | number | Number | BigInteger | boolean | Boolean | Function | ((...args: any[]) => any) | undefined | null;
export declare enum Write {
    Set = 0,
    Fallback = 1,
    Assign = 2,
    Merge = 3
}
declare type DeepSettable<T, P> = {
    (value: NonNullable<T>): DeepWritable<NonNullable<T>, P>;
    (value: undefined extends T ? undefined : never): DeepWritable<undefined, P>;
    (value: null extends T ? null : never): DeepWritable<null, P>;
    (): T;
};
declare type DeepMergable<T, P> = {
    <W extends Write>(value: W extends Write.Set ? NonNullable<T> : W extends Write.Fallback ? T : NonNullable<Partial<T>>, type: W): DeepWritable<NonNullable<T>, P>;
    <W extends Write.Set>(value: undefined extends T ? undefined : never, type: W): DeepWritable<undefined, P>;
    (value: null extends T ? null : never): DeepWritable<null, P>;
};
declare type DeepAssignable<T, P> = NonNullable<T> extends P ? DeepSettable<T, P> : DeepSettable<T, P> & DeepMergable<T, P>;
interface DeepWritableAny<P> {
    readonly [K: string]: DeepWritableAny<P> & DeepAssignable<any, P>;
}
interface DeepWritableArray<T, P> {
    readonly [I: number]: DeepWritable<T, P>;
}
declare type DeepWritableObject<T, P> = {
    [K in keyof NonNullable<T>]-?: DeepWritable<NonNullable<T>[K], P>;
};
declare type DeepWritableType<T, TN, P> = false extends (true & T) ? DeepWritableAny<P> & DeepAssignable<any, P> : TN extends Array<any> ? DeepWritableArray<TN[number], P> : TN extends object ? DeepWritableObject<T, P> : DeepAssignable<T, P>;
export declare type DeepWritable<T, P> = DeepWritableType<T, NonNullable<T>, P> & DeepAssignable<T, P>;
/**
 * Produces a deeply null-coalescing write handle to a nested object tree.
 *
 * A coalesced object is one which allows indefinitely deep nested property access without worrying about undefined or
 * null properties. The write coalescing will allow you to write a deeply nested value even if the path to it, or the
 * object which owns the property, are null or undefined. Any object in the path will be set along with the final
 * property. Properties are set by applying the property access as a function and passing in the new value as an
 * argument. Nested property access fills in the intermediate properties with empty objects, but these can also be
 * applied to provide a specific value.
 *
 * @param obj the object to coalesce.
 */
export declare function write<T extends Object, P = never>(obj: T): DeepWritable<T, P | PrimitiveType>;
export {};
