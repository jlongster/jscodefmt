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
} = require("../utils");
const { locStart, locEnd } = require("../loc");

const { printOptionalToken, printTypeScriptModifiers } = require("./misc");
const { printTernary } = require("./ternary");
const { printFunctionParameters } = require("./function-parameters");
const { printTemplateLiteral } = require("./template-literal");
const { printArrayItems } = require("./array");
const { printObject } = require("./object");
const { printClassProperty, printClassMethod } = require("./class");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./type-parameters");
const { printPropertyKey } = require("./property");
const { printFunctionDeclaration, printMethodInternal } = require("./function");
const { printInterface } = require("./interface");
const { printAssignmentRight } = require("./assignment");
const { printBlock } = require("./block");
const {
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
} = require("./type-annotation");

function printTypescript(path, options, print) {
  const n = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = [];
  switch (n.type) {
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression"
      );

      const castGroup = group([
        "<",
        indent([softline, path.call(print, "typeAnnotation")]),
        softline,
        ">",
      ]);

      const exprContents = [
        ifBreak("("),
        indent([softline, path.call(print, "expression")]),
        softline,
        ifBreak(")"),
      ];

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          [castGroup, path.call(print, "expression")],
          [castGroup, group(exprContents, { shouldBreak: true })],
          [castGroup, path.call(print, "expression")],
        ]);
      }
      return group([castGroup, path.call(print, "expression")]);
    }
    case "TSDeclareFunction":
      return printFunctionDeclaration(path, print, options);
    case "TSExportAssignment":
      return ["export = ", path.call(print, "expression"), semi];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration": {
      if (n.declare) {
        parts.push("declare ");
      }

      const printed = printAssignmentRight(
        n.id,
        n.typeAnnotation,
        n.typeAnnotation && path.call(print, "typeAnnotation"),
        options
      );

      parts.push(
        "type ",
        path.call(print, "id"),
        path.call(print, "typeParameters"),
        " =",
        printed,
        semi
      );

      return group(parts);
    }
    case "TSQualifiedName":
      return join(".", [path.call(print, "left"), path.call(print, "right")]);
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "TSAbstractClassProperty":
      return printClassProperty(path, options, print);
    case "TSInterfaceHeritage":
    case "TSExpressionWithTypeArguments": // Babel AST
      parts.push(path.call(print, "expression"));

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return parts;
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return [
        path.call(print, "label"),
        n.optional ? "?" : "",
        ": ",
        path.call(print, "elementType"),
      ];
    case "TSRestType":
      return ["...", path.call(print, "typeAnnotation")];
    case "TSOptionalType":
      return [path.call(print, "typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSClassImplements":
      return [
        path.call(print, "expression"),
        path.call(print, "typeParameters"),
      ];
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return ["typeof ", path.call(print, "argument")];
    case "TSAbstractKeyword":
      return "abstract";
    case "TSAsyncKeyword":
      return "async";
    case "TSDeclareKeyword":
      return "declare";
    case "TSExportKeyword":
      return "export";
    case "TSNeverKeyword":
      return "never";
    case "TSObjectKeyword":
      return "object";
    case "TSProtectedKeyword":
      return "protected";
    case "TSPrivateKeyword":
      return "private";
    case "TSPublicKeyword":
      return "public";
    case "TSReadonlyKeyword":
      return "readonly";
    case "TSStaticKeyword":
      return "static";
    case "TSUndefinedKeyword":
      return "undefined";
    case "TSUnknownKeyword":
      return "unknown";
    case "TSAsExpression":
      return [
        path.call(print, "expression"),
        " as ",
        path.call(print, "typeAnnotation"),
      ];
    case "TSArrayType":
      return [path.call(print, "elementType"), "[]"];
    case "TSPropertySignature": {
      if (n.export) {
        parts.push("export ");
      }
      if (n.accessibility) {
        parts.push(`${n.accessibility} `);
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path)
      );

      if (n.typeAnnotation) {
        parts.push(": ", path.call(print, "typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }

      return parts;
    }
    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(`${n.accessibility} `);
      }
      if (n.export) {
        parts.push("export ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));

      return parts;
    case "TSTypeQuery":
      return ["typeof ", path.call(print, "exprName")];
    case "TSIndexSignature": {
      const parent = path.getParentNode();

      // The typescript parser accepts multiple parameters here. If you're
      // using them, it makes sense to have a trailing comma. But if you
      // aren't, this is more like a computed property name than an array.
      // So we leave off the trailing comma when there's just one parameter.
      const trailingComma =
        n.parameters.length > 1
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
        n.export ? "export " : "",
        n.accessibility ? [n.accessibility, " "] : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.declare ? "declare " : "",
        "[",
        n.parameters ? parametersGroup : "",
        n.typeAnnotation ? "]: " : "]",
        n.typeAnnotation ? path.call(print, "typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ];
    }
    case "TSTypePredicate":
      return [
        n.asserts ? "asserts " : "",
        path.call(print, "parameterName"),
        n.typeAnnotation ? [" is ", path.call(print, "typeAnnotation")] : "",
      ];
    case "TSNonNullExpression":
      return [path.call(print, "expression"), "!"];
    case "TSImportType":
      return [
        !n.isTypeOf ? "" : "typeof ",
        "import(",
        path.call(print, n.parameter ? "parameter" : "argument"),
        ")",
        !n.qualifier ? "" : [".", path.call(print, "qualifier")],
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSLiteralType":
      return path.call(print, "literal");
    case "TSIndexedAccessType":
      return [
        path.call(print, "objectType"),
        "[",
        path.call(print, "indexType"),
        "]",
      ];
    case "TSConstructSignatureDeclaration":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType": {
      if (n.type !== "TSCallSignatureDeclaration") {
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

      if (n.returnType || n.typeAnnotation) {
        const isType = n.type === "TSConstructorType";
        parts.push(
          isType ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return parts;
    }
    case "TSTypeOperator":
      return [n.operator, " ", path.call(print, "typeAnnotation")];
    case "TSMappedType": {
      const shouldBreak = hasNewlineInRange(
        options.originalText,
        locStart(n),
        locEnd(n)
      );
      return group(
        [
          "{",
          indent([
            options.bracketSpacing ? line : softline,
            n.readonly
              ? [getTypeScriptMappedTypeModifier(n.readonly, "readonly"), " "]
              : "",
            printTypeScriptModifiers(path, options, print),
            path.call(print, "typeParameter"),
            n.optional ? getTypeScriptMappedTypeModifier(n.optional, "?") : "",
            n.typeAnnotation ? ": " : "",
            path.call(print, "typeAnnotation"),
            ifBreak(semi),
          ]),
          printDanglingComments(path, options, /* sameIndent */ true),
          options.bracketSpacing ? line : softline,
          "}",
        ],
        { shouldBreak }
      );
    }
    case "TSMethodSignature":
      parts.push(
        n.accessibility ? [n.accessibility, " "] : "",
        n.export ? "export " : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.computed ? "[" : "",
        path.call(print, "key"),
        n.computed ? "]" : "",
        printOptionalToken(path),
        printFunctionParameters(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      if (n.returnType || n.typeAnnotation) {
        parts.push(
          ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return group(parts);
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", path.call(print, "id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSEnumDeclaration":
      if (n.declare) {
        parts.push("declare ");
      }

      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (n.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

      if (n.members.length === 0) {
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
      parts.push(path.call(print, "id"));
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }
      return parts;
    case "TSImportEqualsDeclaration":
      if (n.isExport) {
        parts.push("export ");
      }
      parts.push(
        "import ",
        path.call(print, "id"),
        " = ",
        path.call(print, "moduleReference")
      );

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSExternalModuleReference":
      return ["require(", path.call(print, "expression"), ")"];
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(n.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (n.declare) {
          parts.push("declare ");
        }
        parts.push(printTypeScriptModifiers(path, options, print));

        const textBetweenNodeAndItsId = options.originalText.slice(
          locStart(n),
          locStart(n.id)
        );

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          n.id.type === "Identifier" &&
          n.id.name === "global" &&
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

      parts.push(path.call(print, "id"));

      if (bodyIsDeclaration) {
        parts.push(path.call(print, "body"));
      } else if (n.body) {
        parts.push(" ", group(path.call(print, "body")));
      } else {
        parts.push(semi);
      }

      return parts;
    }
    // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
    case "TSPrivateIdentifier":
      return n.escapedText;

    case "TSConditionalType":
      return printTernary(path, options, print);

    case "TSInferType":
      return ["infer", " ", path.call(print, "typeParameter")];
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
        path.call(print, "typeName"),
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSTypeAnnotation":
      return path.call(print, "typeAnnotation");
    case "TSEmptyBodyFunctionExpression":
      return printMethodInternal(path, options, print);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return ["?", path.call(print, "typeAnnotation")];
    case "TSJSDocNonNullableType":
      return ["!", path.call(print, "typeAnnotation")];
    case "TSJSDocFunctionType":
      return [
        "function(",
        // The parameters could be here, but typescript-estree doesn't convert them anyway (throws an error).
        "): ",
        path.call(print, "typeAnnotation"),
      ];
  }
}

module.exports = { printTypescript };
