const obj = { a: 0, b: 0 };

async function abc() {
  // @with exclude: Promise
  with (obj) {
    var result = await Promise.resolve(a);
    return result;
  }
}
