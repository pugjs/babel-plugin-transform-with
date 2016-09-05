var _ref = obj || locals;

(function (console) {
  console.log(obj);
  console.log(locals);
})("console" in _ref ? _ref.console : typeof console !== "undefined" ? console : undefined);
