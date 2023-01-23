# same-object

Determine if two objects are deeply equal

```
npm install same-object
```

Supports circular references, Maps, Symbols, etc. Based on: [chaijs/deep-eql](https://github.com/chaijs/deep-eql)

## Usage
``` js
const sameObject = require('same-object')

console.log(sameObject(1, 1)) // true
console.log(sameObject(1, 2)) // false

console.log(sameObject(1, '1')) // true
console.log(sameObject(1, '1', { strict: true })) // false

console.log(sameObject({ foo: 1 }, { foo: 1 })) // true
console.log(sameObject({ foo: 1 }, { foo: 1, bar: true })) // false
```

## API

#### `const bool = sameObject(a, b, [options])`

Compares `a` and `b`, returning whether they are equal or not.

Available `options`:
```js
{
  strict: false
}
```

Loosely comparison (`==`) by default.\
Use `{ strict: true }` for a stronger equality check (`===`).

## License
MIT
