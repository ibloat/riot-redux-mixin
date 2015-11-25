module.exports = function (store) {
  return {
    init: function () {
      this.store = store
    },
    dispatch: function (action) {
      store.dispatch(action)
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
    subscribe: function (selector, callback) {
      if (!callback) {
        callback = this.update
      }
      var _version = 0
      var hasRecomputations = !!selector.recomputations

      function compute () {
        var state = store.getState()
        var selected = selector(state)
        var version = hasRecomputations ? selector.recomputations() : (_version + 1)

        if (version !== _version) {
          _version = version
          callback(selected)
        }
      }

      store.subscribe(compute)
      compute()
    }
  }
}
