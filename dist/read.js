"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const Undefined = {};
const readHandler = {
    get: (target, prop, receiver) => {
        const realTarget = target();
        const result = Reflect.get(realTarget || Undefined, prop, receiver);
        return read(result);
    },
    apply: (target, thisArg, argArray) => {
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
function read(obj) {
    const wrapper = function (fallback) {
        return obj || fallback;
    };
    return new Proxy(wrapper, readHandler);
    // return _read(obj) as DeepReadable<T, P, undefined extends T ? true : false>;
}
exports.read = read;
//# sourceMappingURL=read.js.map