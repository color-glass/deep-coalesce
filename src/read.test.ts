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

import {read} from './read';
import assert = require('assert');

interface TestNestedInterface<T> {
    primitive: T
    optionalPrimitive?: T
    primitiveArray: T[]
    optionalPrimitiveArray?: (T | undefined)[]
}

interface TestInterface<T> extends TestNestedInterface<T> {
    object: TestNestedInterface<T>
    optionalObject?: TestNestedInterface<T>
    objectArray: TestNestedInterface<T | undefined>[]
    optionalObjectArray?: TestNestedInterface<T | undefined>[]
}

const minFixture: TestInterface<string> = {
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

test('direct primitive properties accessible', () => {
    const wrapped = read(minFixture);
    let str: string | undefined | null = wrapped.primitive();
    assert.equal(str, 'test1');

    str = wrapped.optionalPrimitive('test');
    assert.equal(str, 'test2');
});

test('nested primitive properties accessible', () => {
    const value: TestInterface<string> = {
        primitive: 'test1',
        primitiveArray: ["array1"],
        objectArray: [{
            primitive: 'test2',
            primitiveArray: ["array2"],
        }],
        object: {
            primitive: 'test3',
            optionalPrimitive: 'test4',
            primitiveArray: ["array3"]
        },
        optionalObject: {
            primitive: 'test5',
            optionalPrimitive: 'test6',
            primitiveArray: ["array4"]
        }
    };
    const wrapped = read(value);

    let str: string | undefined | null = wrapped.object.primitive();
    assert.equal(str, 'test3');

    str = wrapped.object.optionalPrimitive();
    assert.equal(str, 'test4');

    str = wrapped.optionalObject.primitive();
    assert.equal(str, 'test5');

    str = wrapped.optionalObject.optionalPrimitive();
    assert.equal(str, 'test6');
});

test('read undefined nested values', () => {
    const wrapped = read(minFixture);

    assert.equal(wrapped.optionalObject.optionalPrimitive(), undefined);
});

test('read nested with unset undefined path', () => {
    const wrapped = read(minFixture);

    assert.equal(wrapped.optionalObject.primitive(), undefined);
    assert.equal(wrapped.optionalObject.primitive('test default'), 'test default');
});

test('read nested with set undefined path', () => {
    const wrapped = read(minFixture);

    assert.equal(wrapped.optionalObject.optionalPrimitive('test default'), 'test default');
});

test('read defined nested array values', () => {
    const wrapped = read(minFixture);

    assert.equal(wrapped.objectArray[0].primitiveArray[0](), 'array5');
});
