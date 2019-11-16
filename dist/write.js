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
var Write;
(function (Write) {
    Write[Write["Set"] = 0] = "Set";
    Write[Write["Fallback"] = 1] = "Fallback";
    Write[Write["Assign"] = 2] = "Assign";
    Write[Write["Merge"] = 3] = "Merge";
})(Write = exports.Write || (exports.Write = {}));
const writeHandler = {
    get: (target, prop, receiver) => {
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
    apply: (target, thisArg, argArray) => {
        return target.apply(thisArg, argArray);
    }
};
function _write(obj, parent, prop, isDefault) {
    const wrapper = function (value, type) {
        if (arguments.length == 0) {
            return obj;
        }
        else if (type === undefined || type == Write.Set) {
            Reflect.set(parent, prop, value);
            return _write(value, parent, prop);
        }
        else if (type == Write.Assign) {
            Object.assign(obj, value);
        }
        else if (type == Write.Merge) {
            const newValue = Object.assign({}, value, obj);
            Reflect.set(parent, prop, newValue);
            return _write(newValue, parent, prop);
        }
        else {
            if (isDefault) {
                Reflect.set(parent, prop, value);
                return _write(value, parent, prop);
            }
        }
        return _write(obj, parent, prop);
    };
    wrapper.__parent = parent;
    return new Proxy(wrapper, writeHandler);
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
function write(obj) {
    return _write(obj);
}
exports.write = write;
//# sourceMappingURL=write.js.map