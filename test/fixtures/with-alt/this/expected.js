var _this = this;

before;

var _ref = obj || {};

(function (global) {
  _this.func(global);
})("global" in _ref ? _ref.global : typeof global !== "undefined" ? global : undefined);

after;
