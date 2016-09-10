const obj = { a: 0, b: 0 };

function* abc() {
  var _ret = yield* function* (a, b) {
    var result = yield a;
    result += yield b;
    return {
      v: result
    };
  }("a" in obj ? obj.a : typeof a !== "undefined" ? a : undefined, "b" in obj ? obj.b : typeof b !== "undefined" ? b : undefined);

  if (typeof _ret === "object") return _ret.v;
}

const it = abc();
console.log(it.next(), 0);
console.log(it.next(3), 3);
console.log(it.next(4), 7);
