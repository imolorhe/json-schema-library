import { JsonSchema } from "./types";

export default function resolveRef(schema: JsonSchema, rootSchema: JsonSchema): JsonSchema {
    if (schema == null || schema.$ref == null) {
        return schema;
    }

    if (schema.getRoot) {
        // we actually always need to resolve the schema like this, since returned subschemas
        // must resolve relative from their schema
        const resolvedSchema = schema.getRoot().getRef(schema);
        return resolvedSchema;
    }

    // tryout - this should never be called, except we missed something
    const resolvedSchema = rootSchema.getRef(schema);
    return resolvedSchema;
}
