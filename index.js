module.exports = function (a, b, opts) {
  return same(a, b, opts)
}

function same (a, b, opts, memos) {
  const aIsPrimitive = isPrimitive(a)
  const bIsPrimitive = isPrimitive(b)

  if (aIsPrimitive !== bIsPrimitive) return false

  if (aIsPrimitive && bIsPrimitive) {
    if (opts && opts.strict && typeof a === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
      return true
    }

    return opts && opts.strict ? a === b : a == b // eslint-disable-line eqeqeq
  }

  const aType = type(a)
  const bType = type(b)

  if (aType !== bType) return false

  if (!sameKeys(a, b, opts, memos)) return false

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
    return sameKeyValues(a, b, opts, memos, ['name', 'message'])
  }

  switch (aType) {
    // case 'Arguments':
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

  // if (!sameKeys(a, b, opts, memos)) return false

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

  // set, map

  return equals
}

function sameObject (a, b, opts, memos, aType = null) {
  if (aType === null) aType = type(a) // It would assume same types for simplicity

  if (aType === 'Array' || aType === 'Arguments') {
    if (!sameArray(a, b, opts, memos)) return false
  }

  if (aType === 'Set') {
    if (!sameSet(a, b, opts, memos)) return false
  }

  if (aType === 'Map') {
    if (!sameMap(a, b, opts, memos)) return false
  }

  if (!sameKeyValues(a, b, opts, memos)) return false

  return true
}

function sameRegExp (a, b) {
  // return a.toString() === b.toString()
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
  if (keys === null) keys = Object.keys(a)

  for (const key of keys) {
    if (!same(a[key], b[key], opts, memos)) return false
  }

  return true
}

function sameArray (a, b, opts, memos) {
  if (a.length !== b.length) return false

  // Object.getOwnPropertyNames(a)
  // Object.getOwnPropertyNames(b)

  // Object.prototype.propertyIsEnumerable.call

  /* const filter = opts && opts.strict ? ONLY_ENUMERABLE : ONLY_ENUMERABLE | SKIP_SYMBOLS
  const keys1 = getOwnNonIndexProperties(val1, filter)
  const keys2 = getOwnNonIndexProperties(val2, filter)
  if (keys1.length !== keys2.length) return false
  return keyCheck(val1, val2, strict, memos, kIsArray, keys1) */

  for (let i = 0; i < a.length; i++) {
    const aHasProperty = Object.prototype.hasOwnProperty.call(a, i)
    const bHasProperty = Object.prototype.hasOwnProperty.call(b, i)

    if (aHasProperty) {
      if (!bHasProperty || !same(a[i], b[i], opts, memos)) {
        return false
      }
    } else if (bHasProperty) {
      return false
    } else {
      // Array is sparse
      const aKeys = Object.keys(a)

      for (; i < aKeys.length; i++) {
        const key = aKeys[i]
        if (!Object.prototype.hasOwnProperty.call(b, key) ||
            !same(a[key], b[key], opts, memos)) {
          return false
        }
      }

      if (aKeys.length !== Object.keys(b).length) return false

      return true // + can stop here
    }
  }

  return true // + it's equal but it should still check keys
}

function sameSet (a, b, opts, memos) {
  if (a.size !== b.size) return false

  const set = new Set()

  for (const aValue of a) {
    if (!isPrimitive(aValue)) {
      // Non-null object (non strict only: a not matching primitive)
      set.add(aValue)
    } else if (!b.has(aValue)) {
      if (opts && opts.strict) return false

      // Discard string, symbol, undefined, and null values
      if (!setMightHaveLoosePrim(a, b, aValue, memos)) return false

      set.add(aValue)
    }
  }

  if (set.size > 0) {
    for (const bValue of b) {
      if (!isPrimitive(bValue)) {
        if (!setHasEqualElement(set, bValue, opts, memos)) {
          return false
        }
        continue
      }

      if (opts && opts.strict) continue

      if (a.has(bValue)) continue

      if (setHasEqualElement(set, bValue, opts, memos)) continue

      return false
    }

    return set.size === 0
  }

  return true
}

function setMightHaveLoosePrim (a, b, primitive) {
  const altValue = findLooseMatchingPrimitives(primitive)
  if (altValue != null) return altValue

  return b.has(altValue) && !a.has(altValue)
}

function setHasEqualElement (set, val1, opts, memos) {
  for (const val2 of set) {
    if (same(val1, val2, opts, memos)) {
      set.delete(val2)
      return true
    }
  }

  return false
}

function sameMap (a, b, opts, memos) {
  if (a.size !== b.size) return false // Not needed if externally keys were already checked

  const set = new Set()

  for (const [key, item1] of a) {
    if (!isPrimitive(key)) {
      set.add(key)
    } else {
      const item2 = b.get(key)
      if (((item2 === undefined && !b.has(key)) || !same(item1, item2, opts, memos))) {
        if (opts && opts.strict) return false

        // Discard string, symbol, undefined, and null keys
        if (!mapMightHaveLoosePrim(a, b, key, item1, memos)) return false

        set.add(key)
      }
    }
  }

  if (set.size > 0) {
    for (const [key, item] of b) {
      if (typeof key === 'object' && key !== null) {
        if (!mapHasEqualEntry(set, a, key, item, opts, memos)) {
          return false
        }
        continue
      }

      if (opts && opts.strict) continue

      if (a.has(key) && same(a.get(key), item, { strict: false }, memos)) continue

      if (mapHasEqualEntry(set, a, key, item, { strict: false }, memos)) continue

      return false
    }

    return set.size === 0
  }

  return true
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
  if (bValue === undefined && !b.has(altValue)) return false
  if (!same(item, bValue, { strict: false }, memos)) return false

  return !a.has(altValue) && same(item, bValue, { strict: false }, memos)
}

function findLooseMatchingPrimitives (primitive) {
  switch (typeof primitive) {
    case 'undefined':
      return null
    case 'object':
      return undefined
    case 'symbol':
      return false
    case 'string':
      primitive = +primitive
      // Falls through
    case 'number':
      if (Number.isNaN(primitive)) {
        return false
      }
  }
  return true
}

function sameIterable (a, b, opts, memos) {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (!same(a[i], b[i], opts, memos)) {
      return false
    }
  }

  return true
}

function isPrimitive (value) {
  return value === null || typeof value !== 'object'
}

function type (o) {
  // if (Array.isArray(o)/* && !(Symbol.toStringTag in o) */) return 'Array'

  const proto = Object.getPrototypeOf(o)

  // should be static obvs or removed / not needed
  // const MAP_ENTRIES_PROTOTYPE = Object.getPrototypeOf(new Map().entries())
  // const SET_ENTRIES_PROTOTYPE = Object.getPrototypeOf(new Set().entries())
  // const ARRAY_ITERATOR_PROTOTYPE = Object.getPrototypeOf([][Symbol.iterator]())
  // const STRING_ITERATOR_PROTOTYPE = Object.getPrototypeOf(''[Symbol.iterator]())

  if (proto === null) return 'Object'
  // if (proto === Array.prototype) return 'Array'
  // if (proto === RegExp.prototype) return 'RegExp'
  // if (proto === Date.prototype) return 'Date'
  // if (proto === Promise.prototype) return 'Promise'
  // if (proto === Set.prototype) return 'Set'
  // if (proto === Map.prototype) return 'Map'
  // if (proto === WeakSet.prototype) return 'WeakSet'
  // if (proto === WeakMap.prototype) return 'WeakMap'
  // if (proto === DataView.prototype) return 'DataView'

  // if (proto === MAP_ENTRIES_PROTOTYPE) return 'Map Iterator'
  // if (proto === SET_ENTRIES_PROTOTYPE) return 'Set Iterator'
  // if (proto === ARRAY_ITERATOR_PROTOTYPE) return 'Array Iterator'
  // if (proto === STRING_ITERATOR_PROTOTYPE) return 'String Iterator'

  return Object.prototype.toString.call(o).slice(8, -1)
}
