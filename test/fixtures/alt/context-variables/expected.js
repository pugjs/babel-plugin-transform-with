const log = console.log.bind(console);

(function (log) {
  log(undefined, NaN, Infinity, -Infinity);
})("log" in obj ? obj.log : typeof log !== "undefined" ? log : undefined);
