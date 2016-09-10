var _this = this;

// before1
var _ref3 = {};

(function (console) {
  // before2
  var _ref2 = {};

  (function (console) {
    // before3
    var _ref = {};

    (function (console) {
      console.log(_this.getStr());
    })("console" in _ref ? _ref.console : typeof console !== "undefined" ? console : undefined);
    // after3

  })("console" in _ref2 ? _ref2.console : typeof console !== "undefined" ? console : undefined);
  // after2

})("console" in _ref3 ? _ref3.console : typeof console !== "undefined" ? console : undefined);
// after1
