(function (console, a) {
  console.log(a);
})("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined, "a" in obj ? obj.a : typeof a !== "undefined" ? a : undefined);
