module.exports = function (store) {
  return {
    init: function () {
      this.store = store
    },
    dispatch: function (action) {
      return store.dispatch(action)
    },
    dispatchify: function (actions) {
      var keys = Object.keys(actions)
      for (var idx in keys) {
        var key = keys[idx]
        var action = actions[key]

        this[key] = (function (action) {
          var isFunction = typeof action === 'function'
          return function () {
            var obj = isFunction ? action.apply(this, arguments) : action
            return store.dispatch(obj)
          }
        })(action)
      }
    },
    subscribe: function (selector, callback, changed) {
      if (!callback) {
        callback = this.update
      }

      var f = function (previous) { return !previous }
      switch (typeof changed) {
        case 'function':
          f = changed
          break
        case 'string':
          f = selector[changed] ? selector[changed] : f
          break
        case 'undefined':
          f = selector.recomputations ? selector.recomputations : f
      }

      var version
      changed = function (previous) {
        version = f(previous)
        return previous !== version
      }

      function compute () {
        var state = store.getState()
        var selected = selector(state)

        if (changed(version)) {
          callback(selected)
        }
      }

      var unsubscribe = store.subscribe(compute)
      this.on('unmount', unsubscribe)
      compute()
      return unsubscribe
    }
  }
}
