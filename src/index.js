import hasBindingUnderPath from './binding-under-path.js';

export default function ({template, traverse, types: t}) {
  const annotationRegex = /^@with(?:\s+exclude\s*:\s*(.+)|$)/;

  const buildParamDef = template(`
    STRING in REF ?
      REF.NAME :
      typeof NAME !== "undefined" ?
        NAME :
        undefined
  `);

  const buildRetCheck = template(`
    if (typeof RETURN === "object") return RETURN.v;
  `);

  const loopLabelVisitor = {
    LabeledStatement({node}, state) {
      state.innerLabels.add(node.label.name);
    }
  };

  const globalsVisitor = {
    AssignmentExpression(path, {globals, rootPath}) {
      for (let name in path.getBindingIdentifiers()) {
        if (!hasBindingUnderPath(path, rootPath, name)) {
          globals[name] = true;
        }
      }
    },

    ReferencedIdentifier(path, {globals, rootPath}) {
      if (!path.parentPath.isBreakStatement() && !path.parentPath.isContinueStatement()) {
        if (!hasBindingUnderPath(path, rootPath, path.node.name)) {
          globals[path.node.name] = true;
        }
      }
    }
  };

  function loopNodeTo(node) {
    if (t.isBreakStatement(node)) {
      return "break";
    } else if (t.isContinueStatement(node)) {
      return "continue";
    }
  }

  const continuationVisitor = {
    Loop(path, state) {
      let oldIgnoreLabeless = state.ignoreLabeless;
      state.ignoreLabeless = true;
      path.traverse(continuationVisitor, state);
      state.ignoreLabeless = oldIgnoreLabeless;
      path.skip();
    },

    Function(path, state) {
      path.skip();
    },

    SwitchCase(path, state) {
      let oldInSwitchCase = state.inSwitchCase;
      state.inSwitchCase = true;
      path.traverse(continuationVisitor, state);
      state.inSwitchCase = oldInSwitchCase;
      path.skip();
    },

    'BreakStatement|ContinueStatement|ReturnStatement'(path, state) {
      let {node, scope} = path;
      if (node[this.LOOP_IGNORE]) return;

      let replace;
      let loopText = loopNodeTo(node);

      if (loopText) {
        if (node.label) {
          // we shouldn't be transforming this because it exists somewhere inside
          if (state.innerLabels.has(node.label.name)) {
            return;
          }

          loopText = `${loopText}|${node.label.name}`;
        } else {
          // we shouldn't be transforming these statements because
          // they don't refer to the actual loop we're scopifying
          if (state.ignoreLabeless) return;
          if (state.inSwitchCase) return;

          if (t.isBreakStatement(node)) {
            const parent = path.findParent(path => path.isLoop() || path.isSwitchStatement());

            // Prevent possible ambiguity later with switch statements.
            // Find parent's label (or add one if there isn't one), and make
            //   the break go to that label.
            let label;
            if (parent.parentPath.isLabeledStatement()) {
              label = parent.parent.label;
            } else {
              label = parent.scope.generateUidIdentifier('outer');
              parent.replaceWith(t.labeledStatement(label, parent.node));
            }
            node.label = label;
            loopText = `${loopText}|${node.label.name}`;
          }
        }

        state.hasBreakContinue = true;
        state.map[loopText] = node;
        replace = t.stringLiteral(loopText);
      }

      if (path.isReturnStatement()) {
        state.hasReturn = true;
        replace = t.objectExpression([
          t.objectProperty(t.identifier("v"), node.argument || scope.buildUndefinedNode())
        ]);
      }

      if (replace) {
        replace = t.returnStatement(replace);
        replace[this.LOOP_IGNORE] = true;
        path.skip();
        path.replaceWith(t.inherits(replace, node));
      }
    }
  };

  return {
    visitor: {
      BlockStatement(path) {
        const {node} = path;
        if (checkComment()) {
          const obj = getExpression();
          path.replaceWith(t.withStatement(obj, node));
        }

        function checkComment() {
          if (node.leadingComments && node.leadingComments.length) {
            const comment = node.leadingComments.slice(-1)[0];
            return annotationRegex.test(comment.value.trim());
          }
          return false;
        }

        function getExpression() {
          const objPath = path.get('body.0');
          if (!objPath || !objPath.isExpressionStatement()) {
            throw (objPath || path).buildCodeFrameError('A @with block must have an expression as its first statement.');
          }
          const {node} = objPath;
          objPath.remove();
          return node.expression;
        }
      },

      WithStatement: {
        exit(path, {
          opts: {
            exclude = []
          }
        }) {
          path.ensureBlock();

          const {node, scope} = path;
          const obj = path.get('object');
          const srcBody = path.get('body');

          exclude = exclude.concat(checkComment());

          // No body
          if (!srcBody || !srcBody.node.body.length) {
            if (obj.isPure()) {
              path.remove();
            } else {
              path.replaceWith(obj.node);
            }
            return;
          }

          // Get globals
          const globalsState = {
            globals: {},
            rootPath: srcBody
          };

          srcBody.traverse(globalsVisitor, globalsState);

          // Handle excludes
          exclude = new Set([
            ...exclude,
            ...traverse.Scope.contextVariables
          ]);
          const vars = Object.keys(globalsState.globals).filter(v => !exclude.has(v));

          // No globals -> no processing needed
          if (!vars.length) {
            const body = [srcBody.node];
            // If the object has
            if (!obj.isPure()) {
              body.unshift(t.expressionStatement(obj.node));
            }
            path.replaceWithMultiple(body);
            return;
          }

          // Look for continuation
          const contState = {
            hasBreakContinue: false,
            ignoreLabeless: false,
            inSwitchCase: false,
            innerLabels: new Set(),
            hasReturn: false,
            // Map of breaks and continues. Key is the returned value, value is
            // the node corresponding to the break/continue.
            map: {},
            LOOP_IGNORE: Symbol()
          };

          srcBody.traverse(loopLabelVisitor, contState);
          srcBody.traverse(continuationVisitor, contState);

          // Code generation
          const body = [];

          // Determine if the ref variable can be used directly, or if
          // a temporary variable has to be used
          let ref = obj.node;
          if (!t.isIdentifier(ref)) {
            ref = scope.generateUidIdentifier('ref');
            body.push(t.variableDeclaration('var', [
              t.variableDeclarator(ref, obj.node)
            ]));
          }

          // Build the main function
          let fn = t.functionExpression(null, vars.map(function (v) {
            return t.identifier(v);
          }), srcBody.node);
          // Inherits the `this` from the parent scope
          fn.shadow = true;

          // Build the main function call
          let call = t.callExpression(fn, vars.map(function (v) {
            return buildParamDef({
              STRING: t.stringLiteral(v),
              NAME: t.identifier(v),
              REF: ref
            }).expression;
          }));

          if (contState.hasReturn || contState.hasBreakContinue) {
            // If necessary, make sure returns, breaks, and continues are
            // handled.
            buildContinuation();
          } else {
            // No returns, breaks, or continues. Just push the call itself.
            body.push(t.expressionStatement(call));
          }

          path.replaceWithMultiple(body);

          function checkComment() {
            if (node.leadingComments && node.leadingComments.length) {
              const comment = node.leadingComments.pop();
              const matches = annotationRegex.exec(comment.value.trim());

              if (!matches) {
                node.leadingComments.push(comment);
                return [];
              }

              // Get rid of the comment completely by removing the trailing
              // comment of the previous node, if it exists.
              let prev = path.getSibling(path.key - 1);
              if (prev.node && prev.node.trailingComments &&
                  prev.node.trailingComments[0] === comment) {
                prev.node.trailingComments.pop();
              }

              if (!matches[1]) {
                return [];
              }

              return matches[1].split(',').map(v => v.trim()).filter(v => v);
            }
          }

          function buildContinuation() {
            // Store returned value in a _ret variable.
            const ret = scope.generateUidIdentifier('ret');
            body.push(t.variableDeclaration('var', [
              t.variableDeclarator(ret, call)
            ]));

            // If there are returns in the body, an object of form {v: value}
            //   will be returned.
            // If `break` and `continue` present in the body with a specified
            //   label, `${keyword}|${label}` will be returned. If not, the
            //   keyword is returned directly.
            // Use a switch-case construct to differentiate between different
            //   return modes. `cases` stores all the individual SwitchCases.
            //   Breaks and continues will be regular cases, while returns are
            //   in `default` and further checked.
            const cases = [];

            const retCheck = buildRetCheck({
              RETURN: ret
            });

            if (contState.hasBreakContinue) {
              for (let key in contState.map) {
                cases.push(t.switchCase(t.stringLiteral(key), [contState.map[key]]));
              }

              if (contState.hasReturn) {
                cases.push(t.switchCase(null, [retCheck]));
              }

              // Optimize the "case" where there is only one case.
              if (cases.length === 1) {
                const single = cases[0];
                body.push(t.ifStatement(
                  t.binaryExpression('===', ret, single.test),
                  single.consequent[0]
                ));
              } else {
                body.push(t.switchStatement(ret, cases));
              }
            } else {
              if (contState.hasReturn) {
                body.push(retCheck);
              }
            }
          }
        }
      }
    }
  };
}
