"use strict";

const {
  builders: { join, hardline, line, softline, group, indent, ifBreak },
} = require("../document");
const { isNextLineEmpty, isNonEmptyArray } = require("../common/util");
const { insertPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");

function genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.kind) {
    case "Document": {
      const parts = [];
      path.each((pathChild, index, definitions) => {
        parts.push(pathChild.call(print));
        if (index !== definitions.length - 1) {
          parts.push(hardline);
          if (
            isNextLineEmpty(options.originalText, pathChild.getValue(), locEnd)
          ) {
            parts.push(hardline);
          }
        }
      }, "definitions");
      return [...parts, hardline];
    }
    case "OperationDefinition": {
      const hasOperation = options.originalText[locStart(n)] !== "{";
      const hasName = !!n.name;
      return [
        hasOperation ? n.operation : "",
        hasOperation && hasName ? [" ", path.call(print, "name")] : "",
        isNonEmptyArray(n.variableDefinitions)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print, n),
        n.selectionSet ? (!hasOperation && !hasName ? "" : " ") : "",
        path.call(print, "selectionSet"),
      ];
    }
    case "FragmentDefinition": {
      return [
        "fragment ",
        path.call(print, "name"),
        isNonEmptyArray(n.variableDefinitions)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        " on ",
        path.call(print, "typeCondition"),
        printDirectives(path, print, n),
        " ",
        path.call(print, "selectionSet"),
      ];
    }
    case "SelectionSet": {
      return [
        "{",
        indent([
          hardline,
          join(
            hardline,
            path.call(
              (selectionsPath) => printSequence(selectionsPath, options, print),
              "selections"
            )
          ),
        ]),
        hardline,
        "}",
      ];
    }
    case "Field": {
      return group([
        n.alias ? [path.call(print, "alias"), ": "] : "",
        path.call(print, "name"),
        n.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print, n),
        n.selectionSet ? " " : "",
        path.call(print, "selectionSet"),
      ]);
    }
    case "Name": {
      return n.value;
    }
    case "StringValue": {
      if (n.block) {
        return [
          '"""',
          hardline,
          join(hardline, n.value.replace(/"""/g, "\\$&").split("\n")),
          hardline,
          '"""',
        ];
      }
      return [
        '"',
        n.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n"),
        '"',
      ];
    }
    case "IntValue":
    case "FloatValue":
    case "EnumValue": {
      return n.value;
    }
    case "BooleanValue": {
      return n.value ? "true" : "false";
    }
    case "NullValue": {
      return "null";
    }
    case "Variable": {
      return ["$", path.call(print, "name")];
    }
    case "ListValue": {
      return group([
        "[",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "values")),
        ]),
        softline,
        "]",
      ]);
    }
    case "ObjectValue": {
      return group([
        "{",
        options.bracketSpacing && n.fields.length > 0 ? " " : "",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "fields")),
        ]),
        softline,
        ifBreak("", options.bracketSpacing && n.fields.length > 0 ? " " : ""),
        "}",
      ]);
    }
    case "ObjectField":
    case "Argument": {
      return [path.call(print, "name"), ": ", path.call(print, "value")];
    }

    case "Directive": {
      return [
        "@",
        path.call(print, "name"),
        n.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ]),
              softline,
              ")",
            ])
          : "",
      ];
    }

    case "NamedType": {
      return path.call(print, "name");
    }

    case "VariableDefinition": {
      return [
        path.call(print, "variable"),
        ": ",
        path.call(print, "type"),
        n.defaultValue ? [" = ", path.call(print, "defaultValue")] : "",
        printDirectives(path, print, n),
      ];
    }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        n.kind === "ObjectTypeExtension" ? "extend " : "",
        "type ",
        path.call(print, "name"),
        n.interfaces.length > 0
          ? [" implements ", ...printInterfaces(path, options, print)]
          : "",
        printDirectives(path, print, n),
        n.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  path.call(
                    (fieldsPath) => printSequence(fieldsPath, options, print),
                    "fields"
                  )
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "FieldDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        path.call(print, "name"),
        n.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        ": ",
        path.call(print, "type"),
        printDirectives(path, print, n),
      ];
    }

    case "DirectiveDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        "directive ",
        "@",
        path.call(print, "name"),
        n.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        n.repeatable ? " repeatable" : "",
        " on ",
        join(" | ", path.map(print, "locations")),
      ];
    }

    case "EnumTypeExtension":
    case "EnumTypeDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        n.kind === "EnumTypeExtension" ? "extend " : "",
        "enum ",
        path.call(print, "name"),
        printDirectives(path, print, n),

        n.values.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  path.call(
                    (valuesPath) => printSequence(valuesPath, options, print),
                    "values"
                  )
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "EnumValueDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        path.call(print, "name"),
        printDirectives(path, print, n),
      ];
    }

    case "InputValueDefinition": {
      return [
        path.call(print, "description"),
        n.description ? (n.description.block ? hardline : line) : "",
        path.call(print, "name"),
        ": ",
        path.call(print, "type"),
        n.defaultValue ? [" = ", path.call(print, "defaultValue")] : "",
        printDirectives(path, print, n),
      ];
    }

    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        n.kind === "InputObjectTypeExtension" ? "extend " : "",
        "input ",
        path.call(print, "name"),
        printDirectives(path, print, n),
        n.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  path.call(
                    (fieldsPath) => printSequence(fieldsPath, options, print),
                    "fields"
                  )
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "SchemaDefinition": {
      return [
        "schema",
        printDirectives(path, print, n),
        " {",
        n.operationTypes.length > 0
          ? indent([
              hardline,
              join(
                hardline,
                path.call(
                  (opsPath) => printSequence(opsPath, options, print),
                  "operationTypes"
                )
              ),
            ])
          : "",
        hardline,
        "}",
      ];
    }

    case "OperationTypeDefinition": {
      return [path.call(print, "operation"), ": ", path.call(print, "type")];
    }

    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        n.kind === "InterfaceTypeExtension" ? "extend " : "",
        "interface ",
        path.call(print, "name"),
        n.interfaces.length > 0
          ? [" implements ", ...printInterfaces(path, options, print)]
          : "",
        printDirectives(path, print, n),
        n.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  path.call(
                    (fieldsPath) => printSequence(fieldsPath, options, print),
                    "fields"
                  )
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "FragmentSpread": {
      return ["...", path.call(print, "name"), printDirectives(path, print, n)];
    }

    case "InlineFragment": {
      return [
        "...",
        n.typeCondition ? [" on ", path.call(print, "typeCondition")] : "",
        printDirectives(path, print, n),
        " ",
        path.call(print, "selectionSet"),
      ];
    }

    case "UnionTypeExtension":
    case "UnionTypeDefinition": {
      return group([
        path.call(print, "description"),
        n.description ? hardline : "",
        group([
          n.kind === "UnionTypeExtension" ? "extend " : "",
          "union ",
          path.call(print, "name"),
          printDirectives(path, print, n),
          n.types.length > 0
            ? [
                " =",
                ifBreak("", " "),
                indent([
                  ifBreak([line, "  "]),
                  join([line, "| "], path.map(print, "types")),
                ]),
              ]
            : "",
        ]),
      ]);
    }

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition": {
      return [
        path.call(print, "description"),
        n.description ? hardline : "",
        n.kind === "ScalarTypeExtension" ? "extend " : "",
        "scalar ",
        path.call(print, "name"),
        printDirectives(path, print, n),
      ];
    }

    case "NonNullType": {
      return [path.call(print, "type"), "!"];
    }

    case "ListType": {
      return ["[", path.call(print, "type"), "]"];
    }

    default:
      /* istanbul ignore next */
      throw new Error(`unknown graphql type: ${JSON.stringify(n.kind)}`);
  }
}

function printDirectives(path, print, n) {
  if (n.directives.length === 0) {
    return "";
  }

  const printed = join(line, path.map(print, "directives"));

  if (n.kind === "FragmentDefinition" || n.kind === "OperationDefinition") {
    return group([line, printed]);
  }

  return [" ", group(indent([softline, printed]))];
}

function printSequence(sequencePath, options, print) {
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print(path);

    if (
      isNextLineEmpty(options.originalText, path.getValue(), locEnd) &&
      i < count - 1
    ) {
      return [printed, hardline];
    }

    return printed;
  });
}

function canAttachComment(node) {
  return node.kind && node.kind !== "Comment";
}

function printComment(commentPath) {
  const comment = commentPath.getValue();
  if (comment.kind === "Comment") {
    return `#${comment.value.trimEnd()}`;
  }

  /* istanbul ignore next */
  throw new Error(`Not a comment: ${JSON.stringify(comment)}`);
}

function printInterfaces(path, options, print) {
  const node = path.getNode();
  const parts = [];
  const { interfaces } = node;
  const printed = path.map((node) => print(node), "interfaces");

  for (let index = 0; index < interfaces.length; index++) {
    const interfaceNode = interfaces[index];
    parts.push(printed[index]);
    const nextInterfaceNode = interfaces[index + 1];
    if (nextInterfaceNode) {
      const textBetween = options.originalText.slice(
        interfaceNode.loc.end,
        nextInterfaceNode.loc.start
      );
      const hasComment = textBetween.includes("#");
      const separator = textBetween.replace(/#.*/g, "").trim();

      parts.push(separator === "," ? "," : " &", hasComment ? line : " ");
    }
  }

  return parts;
}

function clean(/*node, newNode , parent*/) {}
clean.ignoredProperties = new Set(["loc", "comments"]);

function hasPrettierIgnore(path) {
  const node = path.getValue();
  return (
    node &&
    Array.isArray(node.comments) &&
    node.comments.some((comment) => comment.value.trim() === "prettier-ignore")
  );
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma,
  printComment,
  canAttachComment,
};
