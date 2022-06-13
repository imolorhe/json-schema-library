import { JSONSchema, JSONPointer, JSONError } from "./types";
import Core from "./cores/CoreInterface";
export interface OnError {
    (error: JSONError): void;
}
export declare type Options = {
    schema?: JSONSchema;
    pointer?: JSONPointer;
    onError?: OnError;
};
/**
 * @async
 * Validate data by a json schema
 *
 * @param core - validator
 * @param value - value to validate
 * @param options
 * @param options.schema - json schema to use, defaults to core.rootSchema
 * @param options.pointer - json pointer pointing to current value. Used in error reports
 * @param options.onError   - will be called for each error as soon as it is resolved
 * @return list of errors or empty
 */
export default function validateAsync(core: Core, value: any, options?: Options): Promise<Array<JSONError>>;
