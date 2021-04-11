"use strict";

const {
  builders: { join, hardline, line, softline, group, indent, ifBreak },
} = require("../document");
const { isNextLineEmpty, isNonEmptyArray } = require("../common/util");
const { insertPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");

function genericPrint(path, options, print) {
  const node = path.getValue();
  if (!node) {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  switch (node.kind) {
    case "Document": {
      const parts = [];
      path.eachValue((node, index, definitions) => {
        parts.push(print());
        if (index !== definitions.length - 1) {
          parts.push(hardline);
          if (isNextLineEmpty(options.originalText, node, locEnd)) {
            parts.push(hardline);
          }
        }
      }, "definitions");
      return [...parts, hardline];
    }
    case "OperationDefinition": {
      const hasOperation = options.originalText[locStart(node)] !== "{";
      const hasName = Boolean(node.name);
      return [
        hasOperation ? node.operation : "",
        hasOperation && hasName ? [" ", print("name")] : "",
        isNonEmptyArray(node.variableDefinitions)
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
        printDirectives(path, print, node),
        node.selectionSet ? (!hasOperation && !hasName ? "" : " ") : "",
        print("selectionSet"),
      ];
    }
    case "FragmentDefinition": {
      return [
        "fragment ",
        print("name"),
        isNonEmptyArray(node.variableDefinitions)
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
        print("typeCondition"),
        printDirectives(path, print, node),
        " ",
        print("selectionSet"),
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
        node.alias ? [print("alias"), ": "] : "",
        print("name"),
        node.arguments.length > 0
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
        printDirectives(path, print, node),
        node.selectionSet ? " " : "",
        print("selectionSet"),
      ]);
    }
    case "Name": {
      return node.value;
    }
    case "StringValue": {
      if (node.block) {
        return [
          '"""',
          hardline,
          join(hardline, node.value.replace(/"""/g, "\\$&").split("\n")),
          hardline,
          '"""',
        ];
      }
      return [
        '"',
        node.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n"),
        '"',
      ];
    }
    case "IntValue":
    case "FloatValue":
    case "EnumValue": {
      return node.value;
    }
    case "BooleanValue": {
      return node.value ? "true" : "false";
    }
    case "NullValue": {
      return "null";
    }
    case "Variable": {
      return ["$", print("name")];
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
        options.bracketSpacing && node.fields.length > 0 ? " " : "",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "fields")),
        ]),
        softline,
        ifBreak(
          "",
          options.bracketSpacing && node.fields.length > 0 ? " " : ""
        ),
        "}",
      ]);
    }
    case "ObjectField":
    case "Argument": {
      return [print("name"), ": ", print("value")];
    }

    case "Directive": {
      return [
        "@",
        print("name"),
        node.arguments.length > 0
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
      return print("name");
    }

    case "VariableDefinition": {
      return [
        print("variable"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print, node),
      ];
    }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        node.kind === "ObjectTypeExtension" ? "extend " : "",
        "type ",
        print("name"),
        node.interfaces.length > 0
          ? [" implements ", ...printInterfaces(path, options, print)]
          : "",
        printDirectives(path, print, node),
        node.fields.length > 0
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
        print("description"),
        node.description ? hardline : "",
        print("name"),
        node.arguments.length > 0
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
        print("type"),
        printDirectives(path, print, node),
      ];
    }

    case "DirectiveDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        "directive ",
        "@",
        print("name"),
        node.arguments.length > 0
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
        node.repeatable ? " repeatable" : "",
        " on ",
        join(" | ", path.map(print, "locations")),
      ];
    }

    case "EnumTypeExtension":
    case "EnumTypeDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        node.kind === "EnumTypeExtension" ? "extend " : "",
        "enum ",
        print("name"),
        printDirectives(path, print, node),

        node.values.length > 0
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
        print("description"),
        node.description ? hardline : "",
        print("name"),
        printDirectives(path, print, node),
      ];
    }

    case "InputValueDefinition": {
      return [
        print("description"),
        node.description ? (node.description.block ? hardline : line) : "",
        print("name"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print, node),
      ];
    }

    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        node.kind === "InputObjectTypeExtension" ? "extend " : "",
        "input ",
        print("name"),
        printDirectives(path, print, node),
        node.fields.length > 0
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
        printDirectives(path, print, node),
        " {",
        node.operationTypes.length > 0
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
      return [print("operation"), ": ", print("type")];
    }

    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        node.kind === "InterfaceTypeExtension" ? "extend " : "",
        "interface ",
        print("name"),
        node.interfaces.length > 0
          ? [" implements ", ...printInterfaces(path, options, print)]
          : "",
        printDirectives(path, print, node),
        node.fields.length > 0
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
      return ["...", print("name"), printDirectives(path, print, node)];
    }

    case "InlineFragment": {
      return [
        "...",
        node.typeCondition ? [" on ", print("typeCondition")] : "",
        printDirectives(path, print, node),
        " ",
        print("selectionSet"),
      ];
    }

    case "UnionTypeExtension":
    case "UnionTypeDefinition": {
      return group([
        print("description"),
        node.description ? hardline : "",
        group([
          node.kind === "UnionTypeExtension" ? "extend " : "",
          "union ",
          print("name"),
          printDirectives(path, print, node),
          node.types.length > 0
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
        print("description"),
        node.description ? hardline : "",
        node.kind === "ScalarTypeExtension" ? "extend " : "",
        "scalar ",
        print("name"),
        printDirectives(path, print, node),
      ];
    }

    case "NonNullType": {
      return [print("type"), "!"];
    }

    case "ListType": {
      return ["[", print("type"), "]"];
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown graphql type: " + JSON.stringify(node.kind));
  }
}

function printDirectives(path, print, node) {
  if (node.directives.length === 0) {
    return "";
  }

  const printed = join(line, path.map(print, "directives"));

  if (
    node.kind === "FragmentDefinition" ||
    node.kind === "OperationDefinition"
  ) {
    return group([line, printed]);
  }

  return [" ", group(indent([softline, printed]))];
}

function printSequence(sequencePath, options, print) {
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print();

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
    return "#" + comment.value.trimEnd();
  }

  /* istanbul ignore next */
  throw new Error("Not a comment: " + JSON.stringify(comment));
}

function printInterfaces(path, options, print) {
  const node = path.getNode();
  const parts = [];
  const { interfaces } = node;
  const printed = path.map(print, "interfaces");

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
