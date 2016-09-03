var _local = obj || {};

(function (console, a) {
  console.log(a);
})("console" in _local ? _local.console : typeof console !== "undefined" ? console : undefined, "a" in _local ? _local.a : typeof a !== "undefined" ? a : undefined);
