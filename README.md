riot-redux-mixin
================

A riot mixin to connect tags to your redux store.
Memoizing your selectors is probably a good idea (see
https://github.com/ibloat/riot-redux-sample)

### Usage

```js
// get your store
var store = configureStore()

// pass the store to the mixin and tell riot about it
riot.mixin('redux', riotReduxMixin(store))
```
and then in your tags
```js
this.mixin('redux')
```

By doing this you now have the following API available to your tag (in
addition to the store itself)

### API

* `dispatch(action)` - what it says on the box
* `dispatchify({actions})` - this one takes your actions or action
    creators and makes them available in your tag's scope to be dispatched
    directly (without having to wrap them in dispatch() every time).
    The `actions` parameter is an object containing the actions so by calling
    `this.dispatchify({foo})` you then can dispatch `foo` via `this.foo()`
    instead of `this.dispatch(foo())`.
    This is quite handy when you want to dispatch actions from DOM events.
* `subscribe(selector, callback = this.update)` - `selector` gets passed the current
    state and is expected to return only the values you want to watch.
    For larger projects using a memoizing library like reselect is
    probably a good idea. That way your tag will only get updated when
    state relevant to your tag has changed.
    When not passing in a callback your tag will get updated with the new state.
