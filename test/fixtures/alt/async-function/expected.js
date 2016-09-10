const obj = { a: 0, b: 0 };

async function abc() {
  var _ret = await async function (a) {
    var result = await Promise.resolve(a);
    return {
      v: result
    };
  }("a" in obj ? obj.a : typeof a !== "undefined" ? a : undefined);

  if (typeof _ret === "object") return _ret.v;
}
