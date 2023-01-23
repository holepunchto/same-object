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
