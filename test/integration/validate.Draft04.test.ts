import path from "path";
import fs from "fs";
import { expect } from "chai";
import Core from "../../lib/cores/Draft04";
import { JSONSchema } from "../../lib/types";

describe("validate.Draft04", () => {
    let schema: JSONSchema;
    let data: unknown;
    let core: Core;

    beforeEach(() => {
        schema = JSON.parse(
            fs.readFileSync(path.join(__dirname, "support", "default-schema.json"), "utf8")
        );
        data = JSON.parse(
            fs.readFileSync(path.join(__dirname, "support", "default-data.json"), "utf8")
        );
        core = new Core(schema);
    });

    it("should validate test-data by default", () => {
        const errors = core.validate(data);

        expect(errors).to.have.length(0);
    });

    describe("resolveRef", () => {
        it("should discard any properties where $ref is used", () => {
            core.rootSchema = { definitions: { def: { type: "string" } } };
            const result = core.resolveRef({ $ref: "#/definitions/def", title: "a definition" });
            // remove internatls (remoteRef precompilation)
            delete result.__compiled;
            delete result.id;
            expect(result).to.deep.equal({ type: "string" });
        });
    });

    describe("oneOf", () => {
        it("should return a matching schema", () => {
            const result = core.resolveOneOf(5, {
                oneOf: [{ type: "string" }, { type: "number" }]
            });
            expect(result).to.deep.equal({ type: "number" });
        });

        it("should return an error if a matching schema could not be found", () => {
            const result = core.resolveOneOf([], {
                oneOf: [{ type: "string" }, { type: "number" }]
            });
            expect(result.type).to.eq("error");
            expect(result.name).to.eq("OneOfError");
        });

        it("should return an error if multiple schemas match the data", () => {
            const result = core.resolveOneOf(4, {
                oneOf: [
                    { type: "string" },
                    { type: "number", minimum: 2 },
                    { type: "number", minimum: 3 }
                ]
            });
            expect(result.type).to.eq("error");
            expect(result.name).to.eq("MultipleOneOfError");
        });
    });
});
