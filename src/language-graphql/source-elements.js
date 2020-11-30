"use strict";

const graphqlSourceElements = new Set([
  "OperationDefinition",
  "FragmentDefinition",
  "VariableDefinition",
  "TypeExtensionDefinition",
  "ObjectTypeDefinition",
  "FieldDefinition",
  "DirectiveDefinition",
  "EnumTypeDefinition",
  "EnumValueDefinition",
  "InputValueDefinition",
  "InputObjectTypeDefinition",
  "SchemaDefinition",
  "OperationTypeDefinition",
  "InterfaceTypeDefinition",
  "UnionTypeDefinition",
  "ScalarTypeDefinition",
]);
function isSourceElement(node) {
  return graphqlSourceElements.has(node.kind);
}

module.exports = isSourceElement;
