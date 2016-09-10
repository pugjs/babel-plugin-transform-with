const log = console.log.bind(console);

// @with
{
  obj;
  log(undefined, NaN, Infinity, -Infinity);
}
