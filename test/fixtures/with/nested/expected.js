// before1
var _local3 = obj1 || {};

(function (obj2, obj3, console) {
  // before2
  var _local2 = obj2 || {};

  (function (obj3, console) {
    // before3
    var _local = obj3 || {};

    (function (console) {
      console.log('hey');
    })('console' in _local ? _local.console : typeof console !== "undefined" ? console : undefined);
    // after3

  })('obj3' in _local2 ? _local2.obj3 : typeof obj3 !== "undefined" ? obj3 : undefined, 'console' in _local2 ? _local2.console : typeof console !== "undefined" ? console : undefined);
  // after2

})('obj2' in _local3 ? _local3.obj2 : typeof obj2 !== "undefined" ? obj2 : undefined, 'obj3' in _local3 ? _local3.obj3 : typeof obj3 !== "undefined" ? obj3 : undefined, 'console' in _local3 ? _local3.console : typeof console !== "undefined" ? console : undefined);
// after1
