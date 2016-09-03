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

outer: for (var i = 0; i < 5; i++) {
  var j = 0;

  _outer: do {
    var _ret = function (console, override, correct, doublyCorrect) {
      console.log(i, j);
      if (override(i)) {
        j++;
        return "continue";
      }
      if (correct(j)) {
        return "break|_outer";
      }
      if (doublyCorrect(i, j)) {
        return "break|outer";
      }
    }("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined, "override" in obj ? obj.override : typeof override !== "undefined" ? override : undefined, "correct" in obj ? obj.correct : typeof correct !== "undefined" ? correct : undefined, "doublyCorrect" in obj ? obj.doublyCorrect : typeof doublyCorrect !== "undefined" ? doublyCorrect : undefined);

    switch (_ret) {
      case "continue":
        continue;

      case "break|_outer":
        break _outer;

      case "break|outer":
        break outer;}

    j++;
  } while (j < 5);
}
