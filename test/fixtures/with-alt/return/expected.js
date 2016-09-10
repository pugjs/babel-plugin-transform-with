var _ret = function (c) {
  function b() {
    return c;
  }
  return {
    v: b
  };
  return {
    v: void 0
  };
}("c" in obj ? obj.c : typeof c !== "undefined" ? c : undefined);

if (typeof _ret === "object") return _ret.v;
