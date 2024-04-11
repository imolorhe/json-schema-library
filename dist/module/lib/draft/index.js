import copy from "../utils/copy";
import { createNode, isSchemaNode } from "../types";
export class Draft {
    constructor(config, schema) {
        /** cache for remote schemas */
        this.remotes = {};
        /** error creators by id */
        this.errors = {};
        /** map for valid keywords of a type  */
        this.typeKeywords = {};
        /** keyword validators  */
        this.validateKeyword = {};
        /** type validators  */
        this.validateType = {};
        /** format validators  */
        this.validateFormat = {};
        this.config = config;
        this.typeKeywords = copy(config.typeKeywords);
        this.validateKeyword = Object.assign({}, config.validateKeyword);
        this.validateType = Object.assign({}, config.validateType);
        this.validateFormat = Object.assign({}, config.validateFormat);
        this.errors = Object.assign({}, config.errors);
        this.setSchema(schema);
    }
    get rootSchema() {
        return this.__rootSchema;
    }
    set rootSchema(rootSchema) {
        if (rootSchema == null) {
            return;
        }
        this.__rootSchema = this.config.compileSchema(this, rootSchema);
    }
    /**
     * register a json-schema to be referenced from another json-schema
     * @param url - base-url of json-schema (aka id)
     * @param schema - json-schema root
     */
    addRemoteSchema(url, schema) {
        this.config.addRemoteSchema(this, url, schema);
    }
    compileSchema(schema) {
        var _a;
        return this.config.compileSchema(this, schema, (_a = this.rootSchema) !== null && _a !== void 0 ? _a : schema);
    }
    createSchemaOf(data) {
        return this.config.createSchemaOf(data);
    }
    /**
     * Iterates over data, retrieving its schema
     *
     * @param data - the data to iterate
     * @param callback - will be called with (schema, data, pointer) on each item
     * @param [schema] - the schema matching the data. Defaults to rootSchema
     * @param [pointer] - pointer to current data. Default to rootPointer
     */
    each(data, callback, schema, pointer) {
        return this.config.each(this, data, callback, schema, pointer);
    }
    eachSchema(callback, schema = this.rootSchema) {
        return this.config.eachSchema(schema, callback);
    }
    getChildSchemaSelection(property, schema) {
        return this.config.getChildSchemaSelection(this, property, schema);
    }
    /**
     * Returns the json-schema of a data-json-pointer.
     *
     * To resolve dynamic schema where the type of json-schema is evaluated by
     * its value, a data object has to be passed in options.
     *
     * Per default this function will return `undefined` for valid properties that
     * do not have a defined schema. Use the option `withSchemaWarning: true` to
     * receive an error with `code: schema-warning` containing the location of its
     * last evaluated json-schema.
     *
     * Notes
     *      - uses draft.step to walk through data and schema
     *
     * @param draft
     * @param pointer - json pointer in data to get the json schema for
     * @param [options.data] - the data object, which includes the json pointers value. This is optional, as
     *    long as no oneOf, anyOf, etc statement is part of the pointers schema
     * @param [options.schema] - the json schema to iterate. Defaults to draft.rootSchema
     * @param [options.withSchemaWarning] - if true returns an error instead of `undefined` for valid properties missing a schema definition
     * @return resolved json-schema object of requested json-pointer location
     */
    getSchema(options) {
        return this.config.getSchema(this, options).schema;
    }
    /**
     * Create data object matching the given schema
     *
     * @param [data] - optional template data
     * @param [schema] - json schema, defaults to rootSchema
     * @return created template data
     */
    getTemplate(data, schema, opts = this.config.templateDefaultOptions) {
        return this.config.getTemplate(this, data, schema, opts);
    }
    isValid(data, schema, pointer) {
        return this.config.isValid(this, data, schema, pointer);
    }
    resolveAnyOf(data, schema, pointer) {
        const node = createNode(this, schema, pointer);
        return this.config.resolveAnyOf(node, data);
    }
    resolveAllOf(data, schema) {
        return this.config.resolveAllOf(this, data, schema);
    }
    resolveRef(node) {
        return this.config.resolveRef(node);
    }
    resolveOneOf(data, schema, pointer) {
        const node = createNode(this, schema, pointer);
        return this.config.resolveOneOf(node, data);
    }
    setSchema(schema) {
        this.rootSchema = schema;
    }
    step(key, schema, data, pointer) {
        if (isSchemaNode(key)) {
            return this.config.step(key, schema, data);
        }
        const node = createNode(this, schema !== null && schema !== void 0 ? schema : this.rootSchema, pointer);
        return this.config.step(node, key, data);
    }
    validate(data, schema = this.rootSchema, pointer) {
        if (isSchemaNode(data)) {
            const inputData = schema;
            const inuptNode = data;
            return this.config.validate(inuptNode, inputData);
        }
        const node = createNode(this, schema, pointer);
        return this.config.validate(node, data);
    }
}
