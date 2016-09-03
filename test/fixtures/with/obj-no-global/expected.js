var _local = obj || locals;

(function (console) {
  console.log(obj);
  console.log(locals);
})("console" in _local ? _local.console : typeof console !== "undefined" ? console : undefined);
