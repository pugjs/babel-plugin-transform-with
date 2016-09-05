var obj = {
  correct: function (i) {
    return i === 3;
  }
};

_outer: for (var i = 0; i < 5; i++) {
  var _ret = function (console, i, correct) {
    console.log(i);
    if (correct(i)) {
      return "break|_outer";
    }
  }("console" in obj ? obj.console : typeof console !== "undefined" ? console : undefined, "i" in obj ? obj.i : typeof i !== "undefined" ? i : undefined, "correct" in obj ? obj.correct : typeof correct !== "undefined" ? correct : undefined);

  if (_ret === "break|_outer") break _outer;
}
