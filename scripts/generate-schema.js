#!/usr/bin/env node

"use strict";
const fromPairs = require("lodash/fromPairs");

if (require.main !== module) {
  module.exports = generateSchema;
} else {
  const prettier = require("..");
  console.log(
    prettier.format(
      JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
      { parser: "json" }
    )
  );
}

function generateSchema(options) {
  return {
    $schema: "http://json-schema.org/draft-04/schema#",
    title: "Schema for .prettierrc",
    definitions: {
      optionsDefinition: {
        type: "object",
        properties: fromPairs(
          options.map((option) => [option.name, optionToSchema(option)])
        ),
      },
      overridesDefinition: {
        type: "object",
        properties: {
          overrides: {
            type: "array",
            description:
              "Provide a list of patterns to override prettier configuration.",
            items: {
              type: "object",
              required: ["files"],
              properties: {
                files: {
                  description: "Include these files in this override.",
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                  ],
                },
                excludeFiles: {
                  description: "Exclude these files from this override.",
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                  ],
                },
                options: {
                  type: "object",
                  description: "The options to apply for this override.",
                  $ref: "#/definitions/optionsDefinition",
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
    },
    oneOf: [
      {
        type: "object",
        allOf: [
          { $ref: "#/definitions/optionsDefinition" },
          { $ref: "#/definitions/overridesDefinition" },
        ],
      },
      {
        type: "string",
      },
    ],
  };
}

function optionToSchema(option) {
  return {
    description: option.description,
    default: option.default,
    ...(option.array ? wrapWithArraySchema : identity)(
      option.type === "choice"
        ? { oneOf: option.choices.map(choiceToSchema) }
        : { type: optionTypeToSchemaType(option.type) }
    ),
  };
}

function identity(x) {
  return x;
}

function wrapWithArraySchema(items) {
  return { type: "array", items };
}

function optionTypeToSchemaType(optionType) {
  switch (optionType) {
    case "int":
      return "integer";
    case "boolean":
      return optionType;
    case "choice":
      throw new Error(
        "Please use `oneOf` instead of `enum` for better description support."
      );
    case "path":
      return "string";
    default:
      throw new Error(`Unexpected optionType '${optionType}'`);
  }
}

function choiceToSchema(choice) {
  return { enum: [choice.value], description: choice.description };
}
