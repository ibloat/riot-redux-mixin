var test = require('tape')
var spy = require('sinon').spy
var stub = require('sinon').stub

var reduxMixin = require('..')

function prepare () {
  var initialState = { count: 0 }
  var selectorResult = { value: 0 }
  var store = {
    getState: stub().returns(initialState),
    dispatch: stub().returnsArg(0),
    subscribe: spy()
  }

  var selector = function (state) { return { value: state.count } }

  var i = 0
  var selectorWithRecomputations = function (state) { ++i; return { value: state.count } }
  selectorWithRecomputations.recomputations = function () { return i }

  var selectorWithNoopRecomputations = function (state) { return { value: state.count } }
  selectorWithNoopRecomputations.recomputations = function () { return 0 }

  var action = { type: 'test' }

  return {
    obj: { update: spy() },
    store: store,
    mixin: reduxMixin(store),
    action: action,
    actionCreator: stub().returns(action),
    actionCreatorWithArguments: function (a1, a2) { return { type: 'test', a1: a1, a2: a2 } },
    selector: selector,
    selectorWithRecomputations: selectorWithRecomputations,
    selectorWithNoopRecomputations: selectorWithNoopRecomputations,
    selectorResult: selectorResult
  }
}

test('Store is getting set', function (assert) {
  var p = prepare()

  p.mixin.init.call(p.obj)

  assert.equal(p.obj.store, p.store)

  assert.end()
})

test('Dispatch is passed though to the store', function (assert) {
  var p = prepare()

  var a = p.mixin.dispatch(p.action)

  assert.equal(p.store.dispatch.calledWith(p.action), true)
  assert.equal(p.action, a)

  assert.end()
})

test('Dispatchify sets dispatcher functions', (assert) => {
  var p = prepare()

  p.mixin.dispatchify.call(p.obj, {
    action: p.action,
    action2: p.actionCreator,
    action3: p.actionCreatorWithArguments
  })

  p.obj.action()
  p.obj.action2()
  p.obj.action3(1, 2)

  assert.equal(p.store.dispatch.calledWith(p.action), true)
  assert.equal(p.store.dispatch.calledWith(p.actionCreator()), true)
  assert.equal(p.store.dispatch.calledWith(p.actionCreatorWithArguments(1, 2)), true)
  assert.equal(p.store.dispatch.calledThrice, true)

  assert.end()
})

test('Subscription works', (assert) => {
  var p = prepare()

  p.mixin.subscribe.call(p.obj, p.selector)
  assert.equal(p.obj.update.calledWith(p.selectorResult), true)

  var callback = spy()
  p.mixin.subscribe.call(p.obj, p.selector, callback)
  assert.equal(callback.calledWith(p.selectorResult), true)
  assert.equal(p.store.subscribe.calledTwice, true)
  assert.equal(p.obj.update.calledOnce, true)

  assert.end()
})

test('Subscription works with recomputations', (assert) => {
  var p = prepare()

  p.mixin.subscribe.call(p.obj, p.selectorWithRecomputations)
  assert.equal(p.obj.update.calledWith(p.selectorResult), true)

  var callback = spy()
  p.mixin.subscribe.call(p.obj, p.selectorWithRecomputations, callback)
  assert.equal(callback.calledWith(p.selectorResult), true)

  assert.equal(p.selectorWithRecomputations.recomputations(), 2)
  assert.equal(p.store.subscribe.calledTwice, true)

  assert.end()
})

test('Subscription does not fire callback without selector recomputation', (assert) => {
  var p = prepare()

  p.mixin.subscribe.call(p.obj, p.selectorWithNoopRecomputations)
  assert.equal(p.obj.update.called, false)

  var callback = spy()
  p.mixin.subscribe.call(p.obj, p.selectorWithNoopRecomputations, callback)
  assert.equal(callback.called, false)

  assert.equal(p.store.subscribe.calledTwice, true)

  assert.end()
})
