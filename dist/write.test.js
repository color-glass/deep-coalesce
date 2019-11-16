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
const assert = require("assert");
const write_1 = require("./write");
function getMinFixture() {
    return {
        primitive: 'test1',
        optionalPrimitive: 'test2',
        primitiveArray: ['array1', 'array2'],
        object: {
            primitive: 'test4',
            primitiveArray: ['array3', 'array4']
        },
        objectArray: [{
                primitive: 'test5',
                primitiveArray: ['array5', 'array6']
            }]
    };
}
test('implicit write nested with optional path', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    assert.equal(value.optionalObject, undefined);
    const result = wrapped.optionalObject.optionalPrimitive('test')();
    assert.equal(value.optionalObject && value.optionalObject.optionalPrimitive, 'test');
    assert.equal(result, 'test');
});
test('implicit write in an array', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObjectArray[0].optionalPrimitiveArray[1]('test');
    assert.equal(value.optionalObjectArray[0].optionalPrimitiveArray[1], 'test');
});
test('intermediate value set when undefined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Set).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value set when defined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    value.optionalObject = {
        primitive: 'foo',
        primitiveArray: ['bar']
    };
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Set).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value default set behavior when undefined and no write method set', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value fallback when undefined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Fallback).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value fallback when defined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    value.optionalObject = {
        primitive: 'foo',
        primitiveArray: ['bar']
    };
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Fallback).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'foo',
        primitiveArray: ['bar'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value merge when undefined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Merge).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value merge when defined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    value.optionalObject = {
        primitive: 'foo',
        primitiveArray: ['bar']
    };
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitiveArray: ['other array']
    }, write_1.Write.Merge).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'foo',
        primitiveArray: ['bar'],
        optionalPrimitiveArray: ['other array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value assign when undefined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Assign).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitive: 'optional'
    });
});
test('intermediate value assign when defined', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    value.optionalObject = {
        primitive: 'foo',
        primitiveArray: ['bar'],
        optionalPrimitiveArray: ['other array']
    };
    wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Assign).optionalPrimitive('optional');
    assert.deepEqual(value.optionalObject, {
        primitive: 'required',
        primitiveArray: ['array'],
        optionalPrimitiveArray: ['other array'],
        optionalPrimitive: 'optional'
    });
});
test('return current value', () => {
    const value = getMinFixture();
    const wrapped = write_1.write(value);
    value.optionalObject = {
        primitive: 'foo',
        primitiveArray: ['bar'],
        optionalPrimitiveArray: ['other array']
    };
    const result = wrapped.optionalObject({
        primitive: 'required',
        primitiveArray: ['array']
    }, write_1.Write.Assign).optionalPrimitive('optional')();
    assert.equal(result, 'optional');
    assert.equal(wrapped.optionalObject.primitive(), 'required');
});
//# sourceMappingURL=write.test.js.map