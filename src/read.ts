/*
 * Copyright 2019 Color-Glass Studios, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type PrimitiveType = string | String | number | Number | BigInteger | boolean | Boolean |
    Function | ((...args: any[]) => any) | undefined | null;

type NonUndefined<T> = T extends undefined ? never : T;

type DeepResolvableUndefined<T> = {
    (fallback: NonUndefined<T>): NonUndefined<T>;

    (fallback?: undefined): T | undefined;
}

type DeepResolvableDefined<T> = {
    (): T;
}

type DeepResolvable<T, D extends boolean> = D extends true ? DeepResolvableUndefined<T> : undefined extends T ?
    DeepResolvableUndefined<T> : DeepResolvableDefined<T>;

interface DeepReadableAny extends DeepResolvable<any, true> {
    readonly [K: string]: DeepReadableAny;
}

type DeepReadableObject<T, P, D extends boolean> = {
    readonly [K in keyof NonNullable<T>]-?: DeepReadable<NonNullable<T>[K], P,
        undefined extends T ? true : null extends T ? true : D extends true ? true : false>;
};

interface DeepReadableArray<T, P, D extends boolean> {
    length: DeepReadable<number, P, D>

    readonly [I: number]: DeepReadable<T, P, D>;
}

type DeepReadableType<T, TN, P, D extends boolean> =
    false extends (true & T) ? DeepReadableAny : // Non-typed access for any.
        TN extends P ? DeepResolvable<T, D> : // No nesting for primitives.
            TN extends Array<any> ? DeepReadableArray<TN[number], P, D> : // Index-based access for arrays.
                TN extends object ? DeepReadableObject<T, P, D> : // Typed property access for general objects.
                    DeepResolvable<T, D>; // No nesting for anything else.

export type DeepReadable<T, P = PrimitiveType, D extends boolean = false> =
    DeepReadableType<T, NonNullable<T>, P, D> & DeepResolvable<T, D>

const Undefined = {};

const readHandler: ProxyHandler<any> = {
    get: (target: any, prop: PropertyKey, receiver: any): any => {
        const realTarget = target();
        const result = Reflect.get(realTarget || Undefined, prop, receiver);
        return read(result);
    },
    apply: (target: any, thisArg: any, argArray?: any): any => {
        return target.apply(thisArg, argArray);
    }
};

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
export function read<T, P = never>(obj: T): DeepReadable<T, PrimitiveType, undefined extends T ? true : false> {
    const wrapper = function (fallback?: T) {
        return obj || fallback;
    };
    return new Proxy(wrapper, readHandler) as any;
}

