# babel-plugin-transform-with

Babel plugin that turns `with` statements into strict-mode JS.

- [x] Alternative strict-mode-compatible syntax
- [x] Falls back to global variables if a variable is not available in the object
- [x] Supports [`this` references][this]
- [x] Supports [nesting]
- [x] Supports [`return`], [`break`], [`continue`]
- [x] Supports [`yield`], [`await`]
- [ ] Supports `arguments` (unlikely to be supported)

[![Build Status](https://img.shields.io/travis/pugjs/babel-plugin-transform-with/master.svg)](https://travis-ci.org/pugjs/babel-plugin-transform-with)
[![Dependency Status](https://img.shields.io/david/pugjs/babel-plugin-transform-with.svg)](https://david-dm.org/pugjs/babel-plugin-transform-with)
[![NPM version](https://img.shields.io/npm/v/babel-plugin-transform-with.svg)](https://www.npmjs.org/package/babel-plugin-transform-with)

[this]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/this
[nesting]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/nested
[`return`]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/return
[`break`]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/loop-outside-single
[`continue`]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/loop-outside-multiple
[`yield`]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/generator-function
[`await`]: https://github.com/pugjs/babel-plugin-transform-with/tree/master/test/fixtures/with/async-function

## Alternative syntax

Babel errors out on any `with` statements during parsing by default, which can be frustrating when eventually the code will be converted anyway. This plugin implements an escape hatch using comments:

```js
with (obj || {}) {
  console.log(str);
}

// The `with` block above is equivalent to the following:

// @with
{
  obj || {};
  console.log(str);
}
```

This feature is enabled by default, but you could set `alternative` option to `false` to disable it.

## Example output

```js
with (obj || {}) {
  console.log(str);
}
```

```js
var _ref = obj || {};

(function (console, str) {
  console.log(str);
})("console" in _ref ?
     _ref.console :
     typeof console !== "undefined" ?
       console :
       undefined,
   "str" in _ref ?
     _ref.str :
     typeof str !== "undefined" ?
       a :
       undefined);
```

## Exclude variables

If there are certain variables that should be regarded as globals and excluded from the closure, there are two ways to make this possible.

The plugin accepts an `exclude` option that takes an array of excluded variable names. This option applies to all `with`s compiled, so it is usually more suitable to be used when the variable is a global, like `Array`, `Object`, `process`, or `console`.

If you want to tweak the excluded variables on a per-instance basis, you can use `@with ignore` annotation (which works for both `with () {}` construct and the alternative syntax):

```js
var i = 0, j = 0, k = 0;
var obj = { i: 1, j: 1, k: 0 };

// @with exclude: i
with (obj) {
  console.log(i, j);
}

// @with exclude: i, j
with (obj) {
  console.log(i, j);
}
```

results in

```js
var i = 0, j = 0, k = 0;
var obj = { i: 1, j: 1, k: 0 };

(function (console, j) {
  console.log(i, j);
})("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined, "j" in obj ? obj.j : typeof j !== "undefined" ? j : undefined);

(function (console) {
  console.log(i, j);
})("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined);
```
