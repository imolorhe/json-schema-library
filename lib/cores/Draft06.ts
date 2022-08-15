import CoreInterface from "./CoreInterface";
import step from "../step";
import validate from "../validate";
import resolveOneOf from "../resolveOneOf.strict";
import resolveRef from "../resolveRef.strict";
import getTemplate from "../getTemplate";
import getSchema from "../getSchema";
import each from "../each";
import compileSchema from "../draft06/compile";
import { JSONSchema, JSONPointer } from "../types";

import remotes from "../../remotes";
import draft06 from "../../remotes/draft06.json";

// @ts-ignore
remotes["http://json-schema.org/draft-06/schema"] = compileSchema(draft06);

import TYPE_KEYWORD_MAPPING from "../draft06/validation/typeKeywordMapping";
import KEYWORDS from "../draft06/validation/keyword";
import TYPES from "../draft06/validation/type";
import FORMATS from "../validation/format";
import ERRORS from "../validation/errors";

export default class Draft06Core extends CoreInterface {
    constructor(schema?: JSONSchema) {
        super(schema);
        this.typeKeywords = JSON.parse(JSON.stringify(TYPE_KEYWORD_MAPPING));
        this.validateKeyword = Object.assign({}, KEYWORDS);
        this.validateType = Object.assign({}, TYPES);
        this.validateFormat = Object.assign({}, FORMATS);
        this.errors = Object.assign({}, ERRORS);
    }

    get rootSchema() {
        return this.__rootSchema;
    }

    set rootSchema(rootSchema: JSONSchema) {
        if (rootSchema == null) {
            return;
        }
        this.__rootSchema = compileSchema(rootSchema);
    }

    each(data: any, callback, schema: JSONSchema = this.rootSchema, pointer: JSONPointer = "#") {
        each(this, data, callback, schema, pointer);
    }

    validate(data: any, schema: JSONSchema = this.rootSchema, pointer: JSONPointer = "#") {
        return validate(this, data, schema, pointer);
    }

    isValid(data: any, schema: JSONSchema = this.rootSchema, pointer: JSONPointer = "#") {
        return this.validate(data, schema, pointer).length === 0;
    }

    resolveOneOf(data: any, schema: JSONSchema, pointer?: JSONPointer) {
        return resolveOneOf(this, data, schema, pointer);
    }

    resolveRef(schema: JSONSchema) {
        return resolveRef(schema, this.rootSchema);
    }

    getSchema(pointer: JSONPointer, data: any, schema: JSONSchema = this.rootSchema) {
        return getSchema(this, pointer, data, schema);
    }

    getTemplate(data?: unknown, schema: JSONSchema = this.rootSchema) {
        return getTemplate(this, data, schema);
    }

    step(key: string, schema: JSONSchema, data: any, pointer: JSONPointer = "#") {
        return step(this, key, schema, data, pointer);
    }
}
