riot-redux-mixin
================
[![Build Status](https://travis-ci.org/ibloat/riot-redux-mixin.svg?branch=master)](https://travis-ci.org/ibloat/riot-redux-mixin) [![npm version](https://badge.fury.io/js/riot-redux-mixin.svg)](https://badge.fury.io/js/riot-redux-mixin)

A riot mixin to connect tags to your redux store.
Memoizing your selectors is probably a good idea (see
https://github.com/ibloat/riot-redux-sample)

### Usage

```js
// get your store
var store = configureStore()

// pass the store to the mixin and tell riot about it
riot.mixin(riotReduxMixin(store)) // either globally
riot.mixin('redux', riotReduxMixin(store)) // or shared
```
and then in your tags (in case of a shared mixin)
```js
this.mixin('redux')

// if needed mix actions or action creators into the tag via dispatchify
var foo = require('actions/foo')
this.dispatchify({ foo })

// these are now equivalent
this.foo()
this.dispatch(foo())

// if needed subscribe in some way
this.subscribe(function(state) { return { bar: state.foo.bar } }) // this.bar will be set on update
// or use reselect to reduce the amount of update() calls
var selector = require('selectors/bar')
this.subscribe(selector) // whatever object the selector returns will be merged into the tag
// you can also pass in a callback that will be called instead of this.update
this.subscribe(selector, console.log)
```

### API

* `dispatch(action)` - does what it says on the box, returns whatever
    store.dispatch returns.
* `dispatchify({actions})` - this one takes your action objects or action
    creators and makes them available in your tag's scope to be dispatched
    directly (without having to wrap them in dispatch() every time).
    The `actions` parameter is an object containing the actions so by calling
    `this.dispatchify({foo})` you then can dispatch `foo` via `this.foo()`
    instead of `this.dispatch(foo())`.
    This is quite handy when you want to dispatch actions from DOM events.
* `subscribe(selector, callback = this.update, changed=selector.recomputations)` -
    `selector` is a function that gets passed the current state and is expected
    to return an object.
    The object's keys will be merged into the tag's scope.
    For larger projects using a memoizing library like reselect is probably a good
    idea. That way your tag will only get updated when state relevant to your tag
    has changed.

    When not passing in a callback your tag will get updated with the new state
    via `this.update(obj)` otherwise the callback will get called with the selector's
    return value.

    Via the `changed` parameter one can pass either a `function` or a `string` that
    will determine how the selector is checked for updates.
    By default `selector` will be checked for a `recomputations` function which is
    available on `reselect` selectors.  
    If a `function` gets passed in, it will be called with its own previous return value
    and an update will be triggered if the previous value and its return value are not equal.
    E.g. where `foo(prev) { return prev; }` will never update `bar(prev) { return !prev }`
    always will.  
    Passing a `string` will cause the function to be looked up on the `selector`.
    `subscribe` will return an `unsubscribe` function. On `unmount` this function will
    automatically called.
