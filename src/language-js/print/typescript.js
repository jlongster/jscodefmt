"use strict";

const { printDanglingComments } = require("../../main/comments");
const { hasNewlineInRange } = require("../../common/util");
const {
  builders: {
    join,
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    ifBreak,
  },
} = require("../../document");
const {
  isLiteral,
  getTypeScriptMappedTypeModifier,
  shouldPrintComma,
  isCallExpression,
  isMemberExpression,
  danglingCommentMarkerForReadonlyMappedType,
} = require("../utils");
const { locStart, locEnd } = require("../loc");

const { printOptionalToken, printTypeScriptModifiers } = require("./misc");
const { printTernary } = require("./ternary");
const {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} = require("./function-parameters");
const { printTemplateLiteral } = require("./template-literal");
const { printArrayItems } = require("./array");
const { printObject } = require("./object");
const { printClassProperty, printClassMethod } = require("./class");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./type-parameters");
const { printPropertyKey } = require("./property");
const { printFunction, printMethodInternal } = require("./function");
const { printInterface } = require("./interface");
const { printBlock } = require("./block");
const {
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  printIndexedAccessType,
} = require("./type-annotation");

function printTypescript(path, options, print) {
  const node = path.getValue();

  // TypeScript nodes always starts with `TS`
  if (!node.type.startsWith("TS")) {
    return;
  }

  if (node.type.endsWith("Keyword")) {
    return node.type.slice(2, -7).toLowerCase();
  }

  const semi = options.semi ? ";" : "";
  const parts = [];

  switch (node.type) {
    case "TSThisType":
      return "this";
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        node.expression.type === "ArrayExpression" ||
        node.expression.type === "ObjectExpression"
      );

      const castGroup = group([
        "<",
        indent([softline, print("typeAnnotation")]),
        softline,
        ">",
      ]);

      const exprContents = [
        ifBreak("("),
        indent([softline, print("expression")]),
        softline,
        ifBreak(")"),
      ];

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          [castGroup, print("expression")],
          [castGroup, group(exprContents, { shouldBreak: true })],
          [castGroup, print("expression")],
        ]);
      }
      return group([castGroup, print("expression")]);
    }
    case "TSDeclareFunction":
      return printFunction(path, print, options);
    case "TSExportAssignment":
      return ["export = ", print("expression"), semi];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration":
      return printTypeAlias(path, options, print);
    case "TSQualifiedName":
      return join(".", [print("left"), print("right")]);
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "TSAbstractClassProperty":
      return printClassProperty(path, options, print);
    case "TSInterfaceHeritage":
    case "TSExpressionWithTypeArguments": // Babel AST
      parts.push(print("expression"));

      if (node.typeParameters) {
        parts.push(print("typeParameters"));
      }

      return parts;
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return [
        print("label"),
        node.optional ? "?" : "",
        ": ",
        print("elementType"),
      ];
    case "TSRestType":
      return ["...", print("typeAnnotation")];
    case "TSOptionalType":
      return [print("typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSClassImplements":
      return [print("expression"), print("typeParameters")];
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");
    case "TSTypeParameter":
      return printTypeParameter(path, options, print);
    case "TSAsExpression": {
      parts.push(print("expression"), " as ", print("typeAnnotation"));
      const parent = path.getParentNode();
      if (
        (isCallExpression(parent) && parent.callee === node) ||
        (isMemberExpression(parent) && parent.object === node)
      ) {
        return group([indent([softline, ...parts]), softline]);
      }
      return parts;
    }
    case "TSArrayType":
      return [print("elementType"), "[]"];
    case "TSPropertySignature": {
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path)
      );

      if (node.typeAnnotation) {
        parts.push(": ", print("typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (node.initializer) {
        parts.push(" = ", print("initializer"));
      }

      return parts;
    }
    case "TSParameterProperty":
      if (node.accessibility) {
        parts.push(node.accessibility + " ");
      }
      if (node.export) {
        parts.push("export ");
      }
      if (node.static) {
        parts.push("static ");
      }
      if (node.override) {
        parts.push("override ");
      }
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(print("parameter"));

      return parts;
    case "TSTypeQuery":
      return ["typeof ", print("exprName")];
    case "TSIndexSignature": {
      const parent = path.getParentNode();

      // The typescript parser accepts multiple parameters here. If you're
      // using them, it makes sense to have a trailing comma. But if you
      // aren't, this is more like a computed property name than an array.
      // So we leave off the trailing comma when there's just one parameter.
      const trailingComma =
        node.parameters.length > 1
          ? ifBreak(shouldPrintComma(options) ? "," : "")
          : "";

      const parametersGroup = group([
        indent([
          softline,
          join([", ", softline], path.map(print, "parameters")),
        ]),
        trailingComma,
        softline,
      ]);

      return [
        node.export ? "export " : "",
        node.accessibility ? [node.accessibility, " "] : "",
        node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        node.declare ? "declare " : "",
        "[",
        node.parameters ? parametersGroup : "",
        node.typeAnnotation ? "]: " : "]",
        node.typeAnnotation ? print("typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ];
    }
    case "TSTypePredicate":
      return [
        node.asserts ? "asserts " : "",
        print("parameterName"),
        node.typeAnnotation ? [" is ", print("typeAnnotation")] : "",
      ];
    case "TSNonNullExpression":
      return [print("expression"), "!"];
    case "TSImportType":
      return [
        !node.isTypeOf ? "" : "typeof ",
        "import(",
        print(node.parameter ? "parameter" : "argument"),
        ")",
        !node.qualifier ? "" : [".", print("qualifier")],
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSLiteralType":
      return print("literal");
    case "TSIndexedAccessType":
      return printIndexedAccessType(path, options, print);
    case "TSConstructSignatureDeclaration":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType": {
      if (node.type === "TSConstructorType" && node.abstract) {
        parts.push("abstract ");
      }
      if (node.type !== "TSCallSignatureDeclaration") {
        parts.push("new ");
      }

      parts.push(
        group(
          printFunctionParameters(
            path,
            print,
            options,
            /* expandArg */ false,
            /* printTypeParams */ true
          )
        )
      );

      if (node.returnType || node.typeAnnotation) {
        const isType = node.type === "TSConstructorType";
        parts.push(
          isType ? " => " : ": ",
          print("returnType"),
          print("typeAnnotation")
        );
      }
      return parts;
    }
    case "TSTypeOperator":
      return [node.operator, " ", print("typeAnnotation")];
    case "TSMappedType": {
      const shouldBreak = hasNewlineInRange(
        options.originalText,
        locStart(node),
        locEnd(node)
      );
      const printedLeadingCommentsForReadonly = printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        ({ marker }) => marker === danglingCommentMarkerForReadonlyMappedType
      );
      return group(
        [
          "{",
          indent([
            options.bracketSpacing ? line : softline,
            node.readonly
              ? [
                  printedLeadingCommentsForReadonly,
                  printedLeadingCommentsForReadonly && hardline,
                  getTypeScriptMappedTypeModifier(node.readonly, "readonly"),
                  " ",
                ]
              : "",
            printTypeScriptModifiers(path, options, print),
            print("typeParameter"),
            node.optional
              ? getTypeScriptMappedTypeModifier(node.optional, "?")
              : "",
            node.typeAnnotation ? ": " : "",
            print("typeAnnotation"),
            ifBreak(semi),
          ]),
          printDanglingComments(
            path,
            options,
            /* sameIndent */ true,
            ({ marker }) => !marker
          ),
          options.bracketSpacing ? line : softline,
          "}",
        ],
        { shouldBreak }
      );
    }
    case "TSMethodSignature": {
      const kind = node.kind && node.kind !== "method" ? `${node.kind} ` : "";
      parts.push(
        node.accessibility ? [node.accessibility, " "] : "",
        kind,
        node.export ? "export " : "",
        node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        // "abstract" and "declare" are supported by only "babel-ts"
        // https://github.com/prettier/prettier/issues/9760
        node.abstract ? "abstract " : "",
        node.declare ? "declare " : "",
        node.computed ? "[" : "",
        print("key"),
        node.computed ? "]" : "",
        printOptionalToken(path)
      );

      const parametersDoc = printFunctionParameters(
        path,
        print,
        options,
        /* expandArg */ false,
        /* printTypeParams */ true
      );

      const returnTypePropertyName = node.returnType
        ? "returnType"
        : "typeAnnotation";
      const returnTypeNode = node[returnTypePropertyName];
      const returnTypeDoc = returnTypeNode ? print(returnTypePropertyName) : "";
      const shouldGroupParameters = shouldGroupFunctionParameters(
        node,
        returnTypeDoc
      );

      parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

      if (returnTypeNode) {
        parts.push(": ", group(returnTypeDoc));
      }

      return group(parts);
    }
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", print("id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSEnumDeclaration":
      if (node.declare) {
        parts.push("declare ");
      }

      if (node.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (node.const) {
        parts.push("const ");
      }

      parts.push("enum ", print("id"), " ");

      if (node.members.length === 0) {
        parts.push(
          group(["{", printDanglingComments(path, options), softline, "}"])
        );
      } else {
        parts.push(
          group([
            "{",
            indent([
              hardline,
              printArrayItems(path, options, "members", print),
              shouldPrintComma(options, "es5") ? "," : "",
            ]),
            printDanglingComments(path, options, /* sameIndent */ true),
            hardline,
            "}",
          ])
        );
      }

      return parts;
    case "TSEnumMember":
      parts.push(print("id"));
      if (node.initializer) {
        parts.push(" = ", print("initializer"));
      }
      return parts;
    case "TSImportEqualsDeclaration":
      if (node.isExport) {
        parts.push("export ");
      }

      parts.push("import ");

      if (node.importKind && node.importKind !== "value") {
        parts.push(node.importKind, " ");
      }

      parts.push(print("id"), " = ", print("moduleReference"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSExternalModuleReference":
      return ["require(", print("expression"), ")"];
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(node.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration =
        node.body && node.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (node.declare) {
          parts.push("declare ");
        }
        parts.push(printTypeScriptModifiers(path, options, print));

        const textBetweenNodeAndItsId = options.originalText.slice(
          locStart(node),
          locStart(node.id)
        );

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          node.id.type === "Identifier" &&
          node.id.name === "global" &&
          !/namespace|module/.test(textBetweenNodeAndItsId);

        if (!isGlobalDeclaration) {
          parts.push(
            isExternalModule ||
              /(^|\s)module(\s|$)/.test(textBetweenNodeAndItsId)
              ? "module "
              : "namespace "
          );
        }
      }

      parts.push(print("id"));

      if (bodyIsDeclaration) {
        parts.push(print("body"));
      } else if (node.body) {
        parts.push(" ", group(print("body")));
      } else {
        parts.push(semi);
      }

      return parts;
    }
    // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
    case "TSPrivateIdentifier":
      return node.escapedText;

    case "TSConditionalType":
      return printTernary(path, options, print);

    case "TSInferType":
      return ["infer", " ", print("typeParameter")];
    case "TSIntersectionType":
      return printIntersectionType(path, options, print);
    case "TSUnionType":
      return printUnionType(path, options, print);
    case "TSFunctionType":
      return printFunctionType(path, options, print);
    case "TSTupleType":
      return printTupleType(path, options, print);
    case "TSTypeReference":
      return [
        print("typeName"),
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSTypeAnnotation":
      return print("typeAnnotation");
    case "TSEmptyBodyFunctionExpression":
      return printMethodInternal(path, options, print);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return ["?", print("typeAnnotation")];
    case "TSJSDocNonNullableType":
      return ["!", print("typeAnnotation")];
    default:
      /* istanbul ignore next */
      throw new Error(
        `Unknown TypeScript node type: ${JSON.stringify(node.type)}.`
      );
  }
}

module.exports = { printTypescript };
