export default function ({template, traverse, types: t}) {
  const buildParamDef = template(`
    STRING in LOCAL ?
      LOCAL.NAME :
      typeof NAME !== "undefined" ?
        NAME :
        undefined
  `);

  const getGlobalsVisitor = {
    Program({scope}) {
      this.globals = scope.globals;
    }
  };

  function getGlobals(ast) {
    const state = {};
    traverse(t.file(t.program([t.expressionStatement(ast)])), getGlobalsVisitor, null, state);
    return state.globals || {};
  }

  const bodyVisitor = {
    ReferencedIdentifier({node, scope, parentPath}, {globals}) {
      if (!scope.hasBinding(node.name)) {
        globals[node.name] = true;
      }
    },

    ReturnStatement(path, {rootPath}) {
      const {node, scope} = path;
      const rootFunction = rootPath.node.arguments[1];
      if (path.getFunctionParent().node === rootFunction) {
        this.hasReturn = true;
        node.argument = t.objectExpression(node.argument ? [
          t.objectProperty(t.identifier('value'), node.argument)
        ] : []);
      }
    }
  };

  return {
    inherits: require('babel-plugin-transform-es2015-arrow-functions'),

    visitor: {
      CallExpression(path, {opts: {
        exclude = []
      }}) {
        const {node, scope, hub, parent} = path;

        if (t.isIdentifier(node.callee) &&
            node.callee.name === '_with') {
          const withCall = node;
          const obj = withCall.arguments[0];
          const srcBody = withCall.arguments[1];

          if (!t.isExpressionStatement(parent)) {
            throw path.buildCodeFrameError('_with must be used as a statement on its own');
          }
          if (!t.isExpression(obj)) {
            throw hub.file.buildCodeFrameError(obj || withCall, 'Expected first parameter of _with to be an expresion');
          }
          if (srcBody && !t.isFunctionExpression(srcBody)) {
            throw hub.file.buildCodeFrameError(srcBody, 'Expected body of _with to be a function expression');
          }

          if (!srcBody) {
            if (scope.isPure(obj)) {
              path.parentPath.remove();
            } else {
              path.replaceWith(obj);
            }
            return;
          }

          const state = {
            rootPath: path,
            globals: {}
          };
          path.traverse(bodyVisitor, state);

          exclude = exclude.concat(Object.keys(getGlobals(obj)), ['_with']);
          const vars = Object.keys(globals).filter(function (v) {
            return exclude.indexOf(v) === -1;
          });

          let local = obj, declareLocal = t.noop();
          if (!t.isIdentifier(local)) {
            local = path.scope.generateUidIdentifier('localsForWith');
            declareLocal = t.variableDeclaration('var', [
              t.variableDeclarator(local, obj)
            ]);
          }

          const body = t.callExpression(
            t.arrowFunctionExpression(
              vars.map(function (v) {
                return t.identifier(v);
              }),
              srcBody.body
            ),
            vars.map(function (v) {
              return buildParamDef({
                STRING: t.stringLiteral(v),
                NAME: t.identifier(v),
                LOCAL: local
              }).expression;
            })
          );

          let bodyContainer;

          if (state.hasReturn) {
            const result = scope.generateUidIdentifier('resultOfWith');
            bodyContainer = [
              declareLocal,
              t.variableDeclaration('var', [
                t.variableDeclarator(result, body)
              ]),
              t.ifStatement(result, t.returnStatement(t.memberExpression(result, t.identifier('value'))))
            ];
          } else {
            bodyContainer = [
              declareLocal,
              t.expressionStatement(body)
            ];
          }

          path.parentPath.replaceWithMultiple(bodyContainer);
        }
      }
    }
  };
}
