// before1
var _ref3 = obj1 || {};

(function (obj2, obj3, console) {
  // before2
  var _ref2 = obj2 || {};

  (function (obj3, console) {
    // before3
    var _ref = obj3 || {};

    (function (console) {
      console.log('hey');
    })('console' in _ref ? _ref.console : typeof console !== "undefined" ? console : undefined);
    // after3

  })('obj3' in _ref2 ? _ref2.obj3 : typeof obj3 !== "undefined" ? obj3 : undefined, 'console' in _ref2 ? _ref2.console : typeof console !== "undefined" ? console : undefined);
  // after2

})('obj2' in _ref3 ? _ref3.obj2 : typeof obj2 !== "undefined" ? obj2 : undefined, 'obj3' in _ref3 ? _ref3.obj3 : typeof obj3 !== "undefined" ? obj3 : undefined, 'console' in _ref3 ? _ref3.console : typeof console !== "undefined" ? console : undefined);
// after1
