/**
 * @draft-07
 */
import { JsonSchema, JsonValidator } from "../types";
import { Draft } from "../draft";
import Q from "../Q";

/**
 * returns if-then-else as a json schema. does not merge with input
 * json schema. you probably will need to do so to correctly resolve
 * references.
 *
 * @returns json schema defined by if-then-else or undefined
 */
export function resolveIfSchema(
    draft: Draft,
    schema: JsonSchema,
    data: unknown
): JsonSchema | undefined {
    if (schema.if == null) {
        return undefined;
    }
    if (schema.if === false) {
        return schema.else;
    }

    if (schema.if && (schema.then || schema.else)) {
        const ifErrors = draft.validate(data, Q.addScope(draft.resolveRef(schema.if), schema.__scope));
        if (ifErrors.length === 0 && schema.then) {
            return draft.resolveRef(schema.then);
        }
        if (ifErrors.length !== 0 && schema.else) {
            return draft.resolveRef(schema.else);
        }
    }
}

/**
 * @returns validation result of it-then-else schema
 */
const validateIf: JsonValidator = (draft, schema, value, pointer) => {
    const resolvedSchema = resolveIfSchema(draft, schema, value);
    if (resolvedSchema) {
        const nextScope = Q.newScope(resolvedSchema, schema.__scope ? {
            pointer,
            history: [...schema.__scope.history]
        } : { pointer, history: [] });
        // @recursiveRef ok, we not just add per pointer, but any evlauation to dynamic scope / validation path
        return draft.validate(value, nextScope, pointer);
    }
};

export { validateIf };
