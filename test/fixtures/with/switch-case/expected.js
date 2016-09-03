var s = 'a';
var obj = {
  str: 'success'
};

_outer: switch (s) {
  case 'a':
    var _ret = function (console, str) {
      console.log(str);
      return 'break|_outer';
    }('console' in obj ? obj.console : typeof console !== "undefined" ? console : undefined, 'str' in obj ? obj.str : typeof str !== "undefined" ? str : undefined);

    if (_ret === 'break|_outer') break _outer;

  case 'b':
    console.log('should not happen');
    break;
}
