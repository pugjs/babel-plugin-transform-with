var _this = this;

// before1
var _local3 = {};

(function (console) {
  // before2
  var _local2 = {};

  (function (console) {
    // before3
    var _local = {};

    (function (console) {
      console.log(_this.getStr());
    })("console" in _local ? _local.console : typeof console !== "undefined" ? console : undefined);
    // after3

  })("console" in _local2 ? _local2.console : typeof console !== "undefined" ? console : undefined);
  // after2

})("console" in _local3 ? _local3.console : typeof console !== "undefined" ? console : undefined);
// after1
