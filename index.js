const deepEql = require('deep-eql')

module.exports = function (a, b, opts) {
  return same(a, b, opts)
}

function same (a, b, opts, memos) {
  // console.log('same', a, b, opts, !!memos)

  /* if (a === b) {
    if (a !== 0) return true
    return opts && opts.strict ? Object.is(a, b) : true
  } */

  const aIsPrimitive = isPrimitive(a)
  const bIsPrimitive = isPrimitive(b)

  if (aIsPrimitive !== bIsPrimitive) return false

  if (aIsPrimitive && bIsPrimitive) {
    if (opts && opts.strict && typeof a === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
      return true
    }

    return opts && opts.strict ? a === b : a == b // eslint-disable-line eqeqeq
  }

  /* if (a.__proto__ !== b.__proto__) { // eslint-disable-line no-proto
    console.log('proto no match', { a, b }, { a: a.__proto__, b: b.__proto__ })
    return false
  } */

  const aType = type(a)
  const bType = type(b)

  if (aType !== bType) {
    // console.log('types no match', { aType, bType })
    return false
  }

  // console.log('TYPE', aType)

  switch (aType) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Date':
      return same(a.valueOf(), b.valueOf(), opts, memos)
  }

  switch (aType) {
    case 'Promise':
    case 'Symbol':
    case 'function':
    // case 'WeakMap':
    // case 'WeakSet':
      return a === b
  }

  if (aType === 'Error') {
    return sameKeyValues(a, b, opts, memos, ['name', 'message', 'code'])
  }

  switch (aType) {
    case 'Arguments':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    // case 'Array':
      return sameIterable(a, b, opts, memos)
    case 'DataView':
      return sameIterable(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength), opts, memos)
    case 'ArrayBuffer':
      return sameIterable(new Uint8Array(a), new Uint8Array(b), opts, memos)
  }

  if (aType === 'RegExp') return sameRegExp(a, b) // a.toString() === b.toString()

  // if (aType === 'Generator') {}

  // typed array, buffer, arraybuffer, sharedarraybuffer

  if (!sameKeys(a, b, opts, memos)) return false

  // console.log('memos start')

  if (!memos) {
    memos = { a: new Map(), b: new Map(), position: 0 }
  } else {
    const memoA = memos.a.get(a)
    if (memoA !== undefined) {
      const memoB = memos.b.get(b)
      if (memoB !== undefined) return memoA === memoB
    }
    memos.position++
  }

  memos.a.set(a, memos.position)
  memos.b.set(b, memos.position)

  const equals = sameObject(a, b, opts, memos, aType)

  memos.a.delete(a)
  memos.b.delete(b)

  // if (aType === 'Object') {}

  // console.log('aType', aType)
  // console.log(a)
  // console.log(b)

  // entriesEqual

  // set, map

  return equals
}

function sameObject (a, b, opts, memos, aType) {
  // console.log('sameObject', a, b, opts, { aType })

  // const aType = type(a) // Assumes same types, simplicity etc
  // console.log('sameObject (Before)')

  if (aType === 'Array') {
    // console.log('sameObject (Array)')
    if (!sameArray(a, b, opts, memos)) return false
  }

  if (aType === 'Set') {
    // console.log('sameObject (Set)')
    if (!sameSet(a, b, opts, memos)) return false
  }

  if (aType === 'Map') {
    // console.log('sameObject (Map)')
    if (!sameMap(a, b, opts, memos)) return false
  }

  // console.log('sameObject (After)')

  if (!sameKeyValues(a, b, opts, memos)) return false

  return true
}

function sameRegExp (a, b) {
  return a.source === b.source && a.flags === b.flags
}

function sameKeys (a, b, opts, memos) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  for (let i = 0; i < aKeys.length; i++) {
    if (!Object.prototype.propertyIsEnumerable.call(b, aKeys[i])) return false
  }

  // + if strict, then check symbol properties: https://github.com/nodejs/node/blob/2adea16e394448c4c87b0639514f8babbeb7a080/lib/internal/util/comparisons.js#L290

  /* if (aKeys.length === 0 &&
      (iterationType === kNoIterator ||
        (iterationType === kIsArray && val1.length === 0) ||
        val1.size === 0)) {
    return true; // + strong true?
  } */

  return true
}

function sameKeyValues (a, b, opts, memos, keys = null) {
  // console.log('sameKeyValues', a, b, opts)
  if (keys === null) keys = Object.keys(a)

  for (const key of keys) {
    // console.log('sameKeyValues', key, a[key], b[key])

    if (!same(a[key], b[key], opts, memos)) return false
  }

  return true
}

function sameArray (a, b, opts, memos) {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (Object.prototype.hasOwnProperty.call(a, i)) {
      if (!Object.prototype.hasOwnProperty.call(b, i) ||
          !same(a[i], b[i], opts, memos)) {
        return false
      }
    } else if (Object.prototype.hasOwnProperty.call(b, i)) {
      return false
    } else {
      // Array is sparse.
      const keysA = Object.keys(a)
      for (; i < keysA.length; i++) {
        const key = keysA[i]
        if (!Object.prototype.hasOwnProperty.call(b, key) ||
            !same(a[key], b[key], opts, memos)) {
          return false
        }
      }
      if (keysA.length !== Object.keys(b).length) {
        return false
      }
      return true // + can stop here
    }
  }

  return true // + it's equal but it should still check keys
}

function sameSet (a, b, opts, memos) {
  // console.log('sameSet', a, b, opts)

  if (a.size !== b.size) return false

  // This is a lazily initiated Set of entries which have to be compared
  // pairwise.
  let set = null;
  for (const val of a) {
    // Note: Checking for the objects first improves the performance for object
    // heavy sets but it is a minor slow down for primitives. As they are fast
    // to check this improves the worst case scenario instead.
    if (!isPrimitive(val)) {
      if (set === null) {
        set = new Set();
      }
      // If the specified value doesn't exist in the second set it's a non-null
      // object (or non strict only: a not matching primitive) we'll need to go
      // hunting for something that's deep-(strict-)equal to it. To make this
      // O(n log n) complexity we have to copy these values in a new set first.
      set.add(val);
    } else if (!b.has(val)) {
      if (opts && opts.strict)
        return false;

      // Fast path to detect missing string, symbol, undefined and null values.
      if (!setMightHaveLoosePrim(a, b, val, memos)) {
        return false;
      }

      if (set === null) {
        set = new Set();
      }
      set.add(val);
    }
  }

  if (set !== null) {
    for (const val of b) {
      // We have to check if a primitive value is already
      // matching and only if it's not, go hunting for it.
      if (!isPrimitive(val)) {
        if (!setHasEqualElement(set, val, opts, memos))
          return false;
      } else if (!(opts && opts.strict) &&
                 !a.has(val) &&
                 !setHasEqualElement(set, val, opts, memos)) {
        return false;
      }
    }
    return set.size === 0;
  }

  return true;
}

function setMightHaveLoosePrim(a, b, primitive) {
  const altValue = findLooseMatchingPrimitives(primitive);
  if (altValue != null)
    return altValue;

  return b.has(altValue) && !a.has(altValue);
}

function setHasEqualElement(set, val1, opts, memos) {
  for (const val2 of set) {
    if (same(val1, val2, opts, memos)) {
      set.delete(val2);
      return true;
    }
  }

  return false;
}

function sameMap (a, b, opts, memos) {
  // console.log('sameMap', a, b, opts)

  if (a.size !== b.size) return false // normally not needed if externally keys were already checked

  let set = null

  for (const [key, item1] of a) {
    // console.log('sameMap', key, item1)

    if (!isPrimitive(key)) {
      if (set === null) set = new Set()
      set.add(key)
    } else {
      // By directly retrieving the value we prevent another b.has(key) check in almost all possible cases.
      const item2 = b.get(key)
      if (((item2 === undefined && !b.has(key)) || !same(item1, item2, opts, memos))) {

        if (opts && opts.strict) {
          return false
        }

        // Fast path to detect missing string, symbol, undefined and null keys.
        if (!mapMightHaveLoosePrim(a, b, key, item1, memos)) {
          return false
        }

        if (set === null) set = new Set()
        set.add(key)
      }
    }
  }

  if (set !== null) {
    for (const { 0: key, 1: item } of b) {
      if (typeof key === 'object' && key !== null) {
        if (!mapHasEqualEntry(set, a, key, item, opts, memos))
          return false;
      } else if (!(opts && opts.strict) &&
                 (!a.has(key) ||
                   !same(a.get(key), item, { strict: false }, memos)) &&
                 !mapHasEqualEntry(set, a, key, item, { strict: false }, memos)) {
        return false;
      }
    }

    return set.size === 0
  }

  return true;
}

function mapHasEqualEntry (set, a, key, bValue, opts, memos) {
  for (const key2 of set) {
    if (same(key, key2, opts, memos) && same(bValue, a.get(key2), opts, memos)) {
      set.delete(key2)
      return true
    }
  }

  return false
}

function mapMightHaveLoosePrim (a, b, primitive, item, memos) {
  const altValue = findLooseMatchingPrimitives(primitive)
  if (altValue != null) return altValue

  const bValue = b.get(altValue)
  if ((bValue === undefined && !b.has(altValue)) ||
      !same(item, bValue, { strict: false }, memos)) {
    return false
  }

  return !a.has(altValue) && same(item, bValue, { strict: false }, memos)
}

function findLooseMatchingPrimitives (primitive) {
  switch (typeof primitive) {
    case 'undefined':
      return null;
    case 'object':
      return undefined;
    case 'symbol':
      return false;
    case 'string':
      primitive = +primitive
    case 'number':
      if (Number.isNaN(primitive)) {
        return false
      }
  }
  return true
}

function sameIterable (a, b, opts, memos) {
  // console.log('sameIterable', a.length, b.length)

  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    // console.log('is same?', a[i], b[i], same(a[i], b[i], opts, memos))

    if (!same(a[i], b[i], opts, memos)) {
      return false
    }
  }

  // console.log('sameIterable same! true')

  return true
}

function isPrimitive (value) {
  return value === null || typeof value !== 'object'
}

function type (o) {
  // console.log('type()', o)

  if (Array.isArray(o) && !(Symbol.toStringTag in o)) return 'Array'
  // if (ArrayBuffer.isView(o)) return

  const proto = Object.getPrototypeOf(o)

  // should be static obvs or removed / not needed
  const MAP_ENTRIES_PROTOTYPE = Object.getPrototypeOf(new Map().entries())
  const SET_ENTRIES_PROTOTYPE = Object.getPrototypeOf(new Set().entries())
  const ARRAY_ITERATOR_PROTOTYPE = Object.getPrototypeOf([][Symbol.iterator]())
  const STRING_ITERATOR_PROTOTYPE = Object.getPrototypeOf(''[Symbol.iterator]())

  if (proto === null) return 'Object'
  // if (proto === Array.prototype) return 'Array'
  if (proto === RegExp.prototype) return 'RegExp'
  if (proto === Date.prototype) return 'Date'
  if (proto === Promise.prototype) return 'Promise'
  if (proto === Set.prototype) return 'Set'
  if (proto === Map.prototype) return 'Map'
  if (proto === WeakSet.prototype) return 'WeakSet'
  if (proto === WeakMap.prototype) return 'WeakMap'
  if (proto === DataView.prototype) return 'DataView'
  if (proto === MAP_ENTRIES_PROTOTYPE) return 'Map Iterator'
  if (proto === SET_ENTRIES_PROTOTYPE) return 'Set Iterator'
  if (proto === ARRAY_ITERATOR_PROTOTYPE) return 'Array Iterator'
  if (proto === STRING_ITERATOR_PROTOTYPE) return 'String Iterator'

  // console.log('default to prototype!')

  return Object.prototype.toString.call(o).slice(8, -1)
}
