import babel from "@babel/core";
import t from "@babel/types";

export default (js) =>
  babel.transformSync(js, {
    plugins: [
      {
        visitor: {
          FunctionDeclaration(path) {
            const { params, body } = path.node;
            const arrowFunc = t.arrowFunctionExpression(params, body);
            path.replaceWith(arrowFunc);
          },
          FunctionExpression(path) {
            const { params, body } = path.node;
            const arrowFunc = t.arrowFunctionExpression(params, body);
            path.replaceWith(arrowFunc);
          },
          ReturnStatement(path) {
            const { argument } = path.node;
            if (argument && path.parentPath.isFunction()) {
              const { params } = path.parentPath.node;
              const c = t.variableDeclaration("const", [
                t.variableDeclarator(t.identifier("c"), t.numericLiteral(1)),
              ]);
              const newBlock = t.blockStatement([
                c,
                t.returnStatement(
                  t.binaryExpression(
                    "+",
                    t.binaryExpression("+", ...params),
                    t.identifier("c")
                  )
                ),
              ]);
              path.replaceWith(newBlock);
            }
          },
        },
      },
    ],
  }).code;
