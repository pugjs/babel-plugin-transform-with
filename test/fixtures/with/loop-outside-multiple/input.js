var obj = {
  override: function (i) {
    return i === 2;
  },
  correct: function (j) {
    return j === 3;
  },
  doublyCorrect: function (i, j) {
    return i === 3 && j === 2;
  }
};

outer:
for (var i = 0; i < 5; i++) {
  var j = 0;
  do {
    // @with exclude: i, j
    with (obj) {
      console.log(i, j);
      if (override(i)) {
        j++;
        continue;
      }
      if (correct(j)) {
        break;
      }
      if (doublyCorrect(i, j)) {
        break outer;
      }
    }
    j++;
  } while (j < 5);
}
