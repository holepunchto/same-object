const same = require('../index.js')

module.exports = function sameArray (a, b, opts, memos) {
  if (a.length !== b.length) return false

  // Object.getOwnPropertyNames(a) and (b)
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

      return true
    }
  }

  return true
}
