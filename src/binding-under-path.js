export default function hasBindingUnderPath(path, rootPath, name) {
  if (!name) return false;
  let binding = path.scope.getBinding(name);

  function ok(path, candidates = [], constantViolation = false) {
    if (constantViolation && !path.isVariableDeclarator()) {
      return false;
    }

    if (path.findParent(p => p === rootPath)) {
      // If the variable is declared but not initialized within the
      // with, the with takes over. Thus, keep searching.
      if (!path.isVariableDeclarator() || path.parent.kind !== 'var' || path.node.init) {
        return true;
      }
    }

    for (let path of candidates) {
      if (ok(path, [], true)) return true;
    }
    return false;
  }

  if (binding) {
    if (ok(binding.path, binding.constantViolations)) return true;
  }

  do {
    if (path.scope.uids[name]) return true;
  } while (path = path.parentPath);

  return false;
}
