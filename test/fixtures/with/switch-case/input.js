var s = 'a';
var obj = {
  str: 'success'
};

switch (s) {
  case 'a':
    with (obj) {
      console.log(str);
      break;
    }
  case 'b':
    console.log('should not happen');
    break;
}
