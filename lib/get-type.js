module.exports = function getType (o) {
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
