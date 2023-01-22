import { mergeSchema } from "../mergeSchema";
import { omit } from "../utils/omit";
import copy from "../utils/copy";
import { mergeArraysUnique } from "../utils/merge";
import { resolveIfSchema } from "./if";
/**
 * resolves schema
 * when complete this will have much duplication to step.object etc
 */
function resolveSchema(draft, schemaToResolve, data) {
    var _a;
    const schema = { ...((_a = draft.resolveRef(schemaToResolve)) !== null && _a !== void 0 ? _a : {}) };
    const ifSchema = resolveIfSchema(draft, schema, data);
    if (ifSchema) {
        return ifSchema;
    }
    return omit(schema, "if", "then", "else");
}
export function resolveAllOf(draft, data, schema = draft.rootSchema) {
    let mergedSchema = copy(schema);
    for (let i = 0; i < schema.allOf.length; i += 1) {
        // @todo introduce draft.resolveSchema to iteratively resolve
        const allOfSchema = resolveSchema(draft, schema.allOf[i], data);
        mergedSchema = mergeArraysUnique(mergedSchema, allOfSchema);
        data = draft.getTemplate(data, mergedSchema);
    }
    delete mergedSchema.allOf;
    return mergedSchema;
}
/**
 * returns allOf as a json schema. does not merge with input json schema. you
 * probably will need to do so to correctly resolve references.
 *
 * @returns json schema defined by allOf or undefined
 */
export function resolveAllOfSchema(draft, schema, data) {
    const { allOf } = schema;
    if (!Array.isArray(allOf) || allOf.length === 0) {
        return;
    }
    let resolvedSchema = {};
    allOf.forEach((subschema) => {
        resolvedSchema = mergeSchema(resolvedSchema, draft.resolveRef(subschema));
    });
    // resolvedSchema.type = resolvedSchema.type || schema.type;
    return resolvedSchema;
}
/**
 * validate allOf definition for given input data
 */
const validateAllOf = (draft, schema, value, pointer) => {
    const { allOf } = schema;
    if (!Array.isArray(allOf) || allOf.length === 0) {
        return;
    }
    const errors = [];
    schema.allOf.forEach((subSchema) => {
        errors.push(...draft.validate(value, subSchema, pointer));
    });
    return errors;
};
export { validateAllOf };
