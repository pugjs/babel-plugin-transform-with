(function (a) {
  a = 0;
})("a" in obj ? obj.a : typeof a !== "undefined" ? a : undefined);
