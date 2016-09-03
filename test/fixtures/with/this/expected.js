var _this = this;

before;

var _local = obj || {};

(function (global) {
  _this.func(global);
})("global" in _local ? _local.global : typeof global !== "undefined" ? global : undefined);

after;
