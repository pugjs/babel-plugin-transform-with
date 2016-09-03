var obj = {
  correct: function (i) {
    return i === 3;
  }
};

for (var i = 0; i < 5; i++) {
  with (obj) {
    console.log(i);
    if (correct(i)) {
      break;
    }
  }
}
