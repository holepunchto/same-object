const deepEql = require('deep-eql')

module.exports = function (a, b, { strict = false } = {}) {
  return deepEql(a, b, { comparator: strict ? null : loose })
}

function isPrimitive (value) {
  return value === null || typeof value !== 'object'
}

function loose (a, b) {
  if (!isPrimitive(a)) return null
  if (!isPrimitive(b)) return null
  return a == b // eslint-disable-line eqeqeq
}

/* function sameObject (a, b, { loosely = false } = {}) {
  console.log('sameObject', [a, b], { loosely })

  if (loosely) {
    if (a == b) {
      console.log('equals loosely!')
      return true
    }
  } else {
    if (a === b) {
      console.log('equals!')
      return true
    }
  }

  const ta = type(a)
  const tb = type(b)
  console.log('types', { ta, tb })

  if (!loosely && ta !== tb) {
    // console.log('different types')
    return false
  }

  if (ta === 'buffer') {
    console.log('it is a buffer')
    return a.equals(b)
  }

  if (ta === 'array') {
    console.log('it is an array')

    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!sameObject(a[i], b[i], { loosely })) return false
    }

    return true
  }

  if (ta === 'number') {
    if (isNaN(a) && isNaN(b)) return !loosely
  }

  if (ta !== 'object') {
    console.log('not an object, so not same')
    return false
  }

  console.log('it is an object')

  const ea = getEntries(a)
  const eb = getEntries(b)

  console.log(ea)
  console.log(eb)

  if (ea.length !== eb.length) return false

  ea.sort(cmp)
  eb.sort(cmp)

  for (let i = 0; i < ea.length; i++) {
    // const diff = loosely ? ea[i][0] != eb[i][0] : ea[i][0] !== eb[i][0]
    const diff = ea[i][0] !== eb[i][0]
    if (diff || !sameObject(ea[i][1], eb[i][1], { loosely })) return false
  }

  return true
}

function getEntries (o) {
  if (o instanceof Map) {
    const e = o.entries()
    return [...e]
  }

  return Object.entries(o)
}

function type (o) {
  const t = typeof o

  return t === 'object'
    ? Array.isArray(o)
      ? 'array'
      : isTypedArray(o)
        ? (typeof o.equals === 'function') ? 'buffer' : 'array'
        : (o === null ? 'null' : 'object')
    : t
}

function isTypedArray (a) {
  return !!a && typeof a.length === 'number' && ArrayBuffer.isView(a.array)
}

function cmp (a, b) {
  return a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1
}
*/
