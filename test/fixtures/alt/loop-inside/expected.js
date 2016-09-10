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

(function (console, override, correct, doublyCorrect) {
  outer: for (var i = 0; i < 5; i++) {
    var j = 0;
    do {
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
      j++;
    } while (j < 5);
  }
})("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined, "override" in obj ? obj.override : typeof override !== "undefined" ? override : undefined, "correct" in obj ? obj.correct : typeof correct !== "undefined" ? correct : undefined, "doublyCorrect" in obj ? obj.doublyCorrect : typeof doublyCorrect !== "undefined" ? doublyCorrect : undefined);
