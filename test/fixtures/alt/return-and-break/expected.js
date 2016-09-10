_outer: do {
  var _ret = function (global) {
    return "break|_outer";
    return {
      v: global
    };
  }("global" in obj ? obj.global : typeof global !== "undefined" ? global : undefined);

  switch (_ret) {
    case "break|_outer":
      break _outer;

    default:
      if (typeof _ret === "object") return _ret.v;
  }
} while (true);
