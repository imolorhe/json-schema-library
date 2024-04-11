import { isSchemaNode } from "./types";
import { mergeSchema } from "./mergeSchema";
// 1. https://json-schema.org/draft/2019-09/json-schema-core#scopes
function resolveRecursiveRef(node) {
    const history = node.path;
    // RESTRICT BY CHANGE IN BASE-URL
    let startIndex = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].$id && /^https?:\/\//.test(history[i].$id)) {
            startIndex = i;
            break;
        }
    }
    // FROM THERE FIND FIRST OCCURENCE OF ANCHOR
    const firstAnchor = history.find((s, index) => index >= startIndex && s.$recursiveAnchor === true);
    if (firstAnchor) {
        return node.next(firstAnchor);
    }
    // THEN RETURN LATEST BASE AS TARGET
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].$id) {
            return node.next(history[i]);
        }
    }
    // OR RETURN ROOT
    return node.next(node.draft.rootSchema);
}
/**
 * @todo update types
 * Note: JsonSchema my be false
 */
export default function resolveRefMerge(node) {
    if (!isSchemaNode(node)) {
        throw new Error("expected node");
    }
    if (node.schema == null) {
        return node;
    }
    if (node.schema.$recursiveRef) {
        return resolveRefMerge(resolveRecursiveRef(node));
    }
    if (node.schema.$ref == null) {
        return node;
    }
    const resolvedSchema = node.draft.rootSchema.getRef(node.schema);
    if (resolvedSchema === false) {
        return node.next(resolvedSchema);
    }
    // @draft >= 2019-09 we now merge schemas: in draft <= 7 $ref is treated as reference, not as schema
    const mergedSchema = mergeSchema(node.schema, resolvedSchema);
    delete mergedSchema.$ref;
    return node.next(mergedSchema);
}
