import _getSchema, { GetSchemaOptions } from "../../../lib/getSchema";
import { SchemaNode } from "../../../lib/schemaNode";
import { Draft } from "../../../lib/draft";
import { Draft04 as Core } from "../../../lib/draft04";
import { expect } from "chai";
import { isJsonError } from "../../../lib/types";
import { resolveOneOfFuzzy } from "../../../lib/features/oneOf";

function getSchema(draft: Draft, options: GetSchemaOptions) {
    const result = _getSchema(draft, options);
    if (result == null || isJsonError(result)) {
        return result;
    }
    return result.schema;
}

describe("issue#19 - getSchema from dependencies", () => {
    let draft: Core;
    beforeEach(
        () =>
        (draft = new Core({
            title: "Fill in some steps",
            required: ["name"],
            properties: {
                name: {
                    title: "Name",
                    type: "string",
                    description: "Unique name of the component"
                },
                generation: {
                    type: "string",
                    title: "Generation Method",
                    enum: ["Hide Custom Field", "Display Custom Field"],
                    default: "Hide Custom Field"
                }
            },
            dependencies: {
                generation: {
                    // oneOfProperty: "generation",
                    oneOf: [
                        {
                            properties: {
                                generation: {
                                    const: "Hide Custom Field"
                                }
                            }
                        },
                        {
                            required: ["customField"],
                            properties: {
                                generation: {
                                    const: "Display Custom Field"
                                },
                                customField: {
                                    title: "Custom Field",
                                    type: "string"
                                }
                            }
                        }
                    ]
                }
            }
        }))
    );

    it("should return correct schema for existing data property 'customField'", () => {
        const schema = getSchema(draft, {
            pointer: "#/customField",
            data: {
                name: "issue #19",
                generation: "Display Custom Field",
                customField: "mi"
            }
        });

        expect(schema).to.deep.equal({
            title: "Custom Field",
            type: "string"
        });
    });

    it("should return correct schema for missing data property 'customField'", () => {
        // strict oneOf resolution will fail here, so we need to either fuzzy resolve oneOf item or
        // directly set "oneOfProperty" to "generation"
        // -> validate schema -> no schema is valid (because gneration is missing here)
        // => tell jlib which schema to resolve or let it retrieve a schema on its own
        draft.resolveOneOf = function resolveOneOf(node: SchemaNode, data) {
            return resolveOneOfFuzzy(node, data);
        };

        const schema = getSchema(draft, {
            pointer: "#/customField",
            data: {
                name: "issue #19",
                generation: "Display Custom Field"
            }
        });

        expect(schema).to.deep.equal({
            title: "Custom Field",
            type: "string"
        });
    });
});
