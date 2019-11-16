# TypeScript Deep Coalescing
The `deep-coalesce` package provides a useful tool for manipulating deeply-nested object structures with undefined and
optional parameters in a safe and concise way. In comparison to pre-existing solutions, `deep-coalesce` has the
following advantages:

* Natural syntax: access nested properties using normal property accessor syntax.
* Ability to both read and write deeply nested values. `deep-coalesce` can get a read-only safe view of a structure but
  can also get a writeable handle as well. It can fill in the structure with default objects as it goes, or fill it in
  with provided fallback values when needed at any level, or merge the fallback values into the existing ones when
  necessary.
* Completely type safe, not only in terms of the original structure but in terms of the effectively accessed structure.
* Powerful type inferencing on resolved properties: `deep-coalesce` has the stricted possible typing on the resulting
  resolved value. Unlike any other library, `deep-coalesce` meets all of the following conditions: a) if the property
  being returned is non-optional and all properties in the path to accessing it are non-optional, the result will be
  non-optional and no fallback argument can be provided, b) even if the property iself is non-optional, it can return
  undefined if any property in the path to it is optional and no fallback is given, and c) if any a property is
  non-optional but any property in the path to it is optional, and a fallback is given, the result is non-optional. This
  practically eliminates unnecessary casting, or operators (`||`), or coalescing operators (`??`) on the results.
* No preprocessing necessary. `deep-coalesce` achieves type safety without requiring any compiler transforms.
* Adaptable to any project's types. `deep-coalesce` has a built-in understanding of primitive types which terminate the
  recursive derived types of coalesced structures in both reads and writes, and uses the type system to prevent
  incorrect types of writes on leaf nodes of the object graph. But additional types can be added to the list of those
  treated as primitives (e.g. if you were using Pulumi, you could add `Input` and `Output` as primitives).
* Null type preservation: despite being able to traverse intermediate properties that are both `undefined` and `null`,
  `deep-coalesce` still handles `null` typing on the resolved leaf property.

## The Problem
JavaScript and TypeScript object trees can be deep and and each level may be `undefined` or `null`. This can lead to
compile time or runtime failures attempting to access deeply nested properties where part of the hierarchy may be left
unspecified. To safely traverse at runtime, and to avoid TypeScript compile time errors, checking at each level must be
done.

```typescript
interface Options {
    storageOptions?: {
        s3Options?: {
            encryption?: {
                keyId?: string,
                type: 'AES256' | 'aws:kms'
            }
        }
    }
}

function readKeyId(options: Options): string | undefined {
    return options.storageOptions && options.storageOptions.s3Options && options.storageOptions.s3Options.encryption &&
        options.storageOptions.s3Options.encryption.keyId;
}
```

This makes the code unnecessarily verbose and difficult to maintain. `deep-coalesce` allows access to nested properties
without concern for `undefined` or `null` values along the path.

```typescript
function readKeyId(options: Options): string | undefined {
    return read(options).storageOptions.s3Options.encryption.keyId();
}
```

In addition, unlike existing solutions, `deep-coalesce` can write nested values while still populating the necessary
path:

```typescript
function setKeyId(options: Options, keyId: string): string {
    // Write the key ID, filling in the path along the way, assigning the correct type, and returning the new key ID.
    return write(options).storageOptions.s3Options.encryption({ type: 'aws:kms' }, Write.Assign).keyId(keyId)();
}
```

Not only is type safety maintained throughout the entire path, but typing remains as strict as possible to avoid
unnecessary type assertions and other workarounds where a type may be incorrectly believed to be optional, keeping
`deep-coalesce` virtually identical in its type behavior to the verbose vanilla methods of nested reads and writes.

## Adding the Package
To add with NPM, run `npm install --save deep-coalesce`, or with Yarn do `yarn add deep-coalesce`.

You can also add it directly to your `package.json` file like so:
```json
{
    ...
    "dependencies": {
        ...
        "deep-coalesce":  "~1.0.0"
    },
    ...
}
```

`deep-coalesce` natively supports TypeScript typing without requiring additional type packages.

## Deeply-Coalesced Reads
A deeply-readable coalesced structure is obtainable using the `read` function. The result of the read call on an object
is a handle to the object with a derived type of the original in which all properties are non-nullable and read-only.
Each property access recursively returns a handle to that nested property with the same derivation of type, merged with
the type of a function call to return the property value. Applying the function will resolve the coalesced value, with
an optional argument provided to be the fallback value in case the coalesced one is `undefined` or `null`. Providing a
fallback value makes the result of the function application non-nullable to TypeScript.

```typescript
import {read} from 'deep-coalesce';

interface Test {
    foo?: {
        bar?: {
            baz?: string
            required: string
        }
    }
    defined: {
        for: string
        nullable: string | null
    }
    nullablePath: {
        required: string
    } | null
}

const value: Test = {
    defined: {
        for: 'certain'
    },
    nullablePath: null
};

read(value).foo.bar.baz();
// Type = string | undefined, Value = undefined.
// This property can be undefined since both it and the path to it can be undefined.

read(value).foo.bar.required();
// Type = string | undefined, Value = undefined
// This property can be undefined since, although it is non-optional, the path to it is optional.

read(value).defined.for();
// Type = string, Value = 'certain'.
// This property, unlike the above one, is definitely string, since it and the path to it is entirely non-optional.

read(value).foo.bar.baz('fallback');
// Type = string, Value = 'fallback'.
// Although the property and its path are optional, a fallback was provided, ensuring this type is strictly string.

read(value).foo.bar();
// Type = { baz?: string } | undefined, Value = undefined..
// Intermediate objects also work as expected.

read(value).foo.bar({});
// Type = { baz?: string }, Value = {}.
// As with primitives, a fallback can be provided and it ensures a defined result.

read(value).nullablePath.required('default');
// Type = string, Value = 'default'
// This expression *requires* a fallback argument, since the property is non-optional, even though the path to it can be
// null. Failure to provide a fallback results in a compile error.

read(value).nullablePath(null);
// Type = { required: string } | null, Value = null
// As this property can be null, a fallback of null can be provided.
```

Primitive values terminate the recursive type system. The built-in primitive types are `string`, `String`, `number`,
`Number`, `boolean`, `Boolean`, `BigInteger`, `Function`, `(...args: any[]) => any`, `null`, and `undefined`. You can
add more to a coalesced type by adding a generic type parameter to define them.

```typescript
import {read} from 'deep-coalesced';

class Person {
    public name: string;
    public address: string;
}
interface Test {
    person?: Person
}
const args: Test = {};
read<Test, Person>(args).person.address; // Error! Output is now treated as a primitive and doesn't nest.
```

## Deeply-Coalesced Writes
A deeply-coalesced write structure is obtained with the `write` function. The result, as with `read`, allows safe access
to arbitrarily deep levels of a structure regardless of nullability. The final property can be applied with a value
argument to set that property to that value.

```typescript
import {write} from 'deep-coalesce';

interface Test {
    foo?: {
        bar?: {
            baz?: string
        }
    }
}

const value: Test = {};
write(value).foo.bar.baz('Baz'); // Value is now { foo: { bar: { baz: 'Baz' }}}
```

Intermediate properties in the path are filled in automatically with empty objects. This behavior can be altered by
applying each of those properties as well. Non-primitive typed properties can optionally take an additional argument
indicating how to perform the assignment. These constants are:

* `Set`: Sets the property to be equal to the value provided. This is the default if no argument is given and the same
  behavior as setting values for primitive types.
* `Fallback`: Sets the property to be equal to the value provided if and only if the current value of the property is
  `undefined` or `null`.
* `Merge`: Assigns the properties of the value provided to the current value of the property, also setting the current
  value to an empty object initially if it is `undefined` or `null`. Only properties that do not exist on the current
  property value are assigned (i.e. the properties on the original property value have priority).
* `Assign`: Assigns the properties of the value provided to the current value of the property the same as `Merge`,
  however gives priority to the provided value (i.e. the original properties may be overwritten).
  
All options are type-safe, e.g. if using `Set` your argument must be strictly conforming to the underlying type, but if
using `Merge` you would only need to comply with the `Partial` of the underlying type.


```typescript
import {Write, write} from 'deep-coalesce';

interface Test {
    foo?: {
        bar?: {
            baz?: string
        }
        hello: string
    }
}

const value: Test = {
    foo: {
        hello: 'World'
    }
};
write(value).foo({ num: 1 }, Write.Merge).bar({ name: null }, Write.Fallback).baz('Baz');
// value is now:
// {
//     foo: {
//         hello: 'World',
//         num: 1,
//         bar: {
//             name: null,
//             baz: 'Baz'
//         }
//     }
// }

const assignTest: Test = {};
write(value).foo.bar({ baz: 'Baz' });
// assignTest is now:
// {
//     foo: {
//         bar: {
//             baz: 'Baz
//         }
//     }
// }
```

The write coalescing operator can also return the value of the leaf node by applying it without any parameters.

```typescript
import {Write, write} from 'deep-coalesce';

interface Test {
    foo?: {
        bar?: {
            baz?: string
        }
        hello: string
    }
}

const value: Test = {
    foo: {
        hello: 'World'
    }
};

write(value).foo.hello(); // Return type string, value 'World'
write(value).foo.bar.baz(); // Return type string | undefined, value undefined
write(value).foo().bar.baz('test')(); // Return type string, value 'test'
```
