const obj = { a: 0, b: 0 };

function* abc() {
  // @with
  {
    obj;
    var result = yield a;
    result += yield b;
    return result;
  }
}

const it = abc();
console.log(it.next(), 0);
console.log(it.next(3), 3);
console.log(it.next(4), 7);
