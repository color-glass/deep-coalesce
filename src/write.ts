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

export enum Write {
    Set,
    Fallback,
    Assign,
    Merge
}

type DeepSettable<T, P> = {
    (value: NonNullable<T>): DeepWritable<NonNullable<T>, P>
    (value: undefined extends T ? undefined : never): DeepWritable<undefined, P>
    (value: null extends T ? null : never): DeepWritable<null, P>
    (): T
}

type DeepMergable<T, P> = {
    <W extends Write>(value: W extends Write.Set ? NonNullable<T> : W extends Write.Fallback ? T : NonNullable<Partial<T>>, type: W): DeepWritable<NonNullable<T>, P>
    <W extends Write.Set>(value: undefined extends T ? undefined : never, type: W): DeepWritable<undefined, P>
    (value: null extends T ? null : never): DeepWritable<null, P>
}

type DeepAssignable<T, P> = NonNullable<T> extends P ? DeepSettable<T, P> : DeepSettable<T, P> & DeepMergable<T, P>

interface DeepWritableAny<P> {
    readonly [K: string]: DeepWritableAny<P> & DeepAssignable<any, P>;
}

interface DeepWritableArray<T, P> {
    readonly [I: number]: DeepWritable<T, P>;
}

type DeepWritableObject<T, P> = {
    [K in keyof NonNullable<T>]-?: DeepWritable<NonNullable<T>[K], P>
}

type DeepWritableType<T, TN, P> =
    false extends (true & T) ? DeepWritableAny<P> & DeepAssignable<any, P> : // Non-typed access for any.
        TN extends Array<any> ? DeepWritableArray<TN[number], P> : // Index-based access for arrays.
            TN extends object ? DeepWritableObject<T, P> : // Typed property access for general objects.
                DeepAssignable<T, P>; // No nesting for anything else.

export type DeepWritable<T, P = PrimitiveType> =
    DeepWritableType<T, NonNullable<T>, P> & DeepAssignable<T, P>

const writeHandler: ProxyHandler<any> = {
    get: (target: any, prop: PropertyKey, receiver: any): any => {
        const realTarget = target();
        let result = Reflect.get(realTarget, prop, receiver);
        let isDefault = false;
        if (result == undefined) {
            result = {};
            isDefault = true;
            Reflect.set(realTarget, prop, result);
        }
        return _write(result, realTarget, prop, isDefault);
    },
    apply: (target: any, thisArg: any, argArray?: any): any => {
        return target.apply(thisArg, argArray);
    }
};

function _write<T extends Object, P>(obj: T | undefined | null, parent?: any, prop?: PropertyKey, isDefault?: boolean): DeepWritable<T, P> {
    const wrapper = function (value: T, type?: Write) {
        if (arguments.length == 0) {
            return obj;
        } else if (type === undefined || type == Write.Set) {
            Reflect.set(parent, prop as PropertyKey, value);
            return _write(value, parent, prop);
        } else if (type == Write.Assign) {
            Object.assign(obj, value);
        } else if (type == Write.Merge) {
            const newValue: any = Object.assign({}, value, obj);
            Reflect.set(parent, prop as PropertyKey, newValue);
            return _write(newValue, parent, prop);
        } else {
            if (isDefault) {
                Reflect.set(parent, prop as PropertyKey, value);
                return _write(value, parent, prop);
            }
        }
        return _write(obj, parent, prop);
    };
    wrapper.__parent = parent;
    return new Proxy(wrapper, writeHandler) as DeepWritable<T, P>;
}

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
export function write<T extends Object, P = never>(obj: T): DeepWritable<T, P | PrimitiveType> {
    return _write(obj) as DeepWritable<T, P | PrimitiveType>;
}
