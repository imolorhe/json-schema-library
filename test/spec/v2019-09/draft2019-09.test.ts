/* eslint max-len: 0 */
import { expect } from "chai";
import { Draft2019 } from "../../../lib/draft2019";
import { addRemotes } from "../utils/addRemotes";
import draft2019Meta from "../../../remotes/draft2019-09.json";
import { getDraftTests, FeatureTest } from "../../getDraftTests";

const cache = new Draft2019();
cache.addRemoteSchema("http://json-schema.org/draft-2019-09/schema", draft2019Meta);
addRemotes(cache);

const supportedTestCases = (t: FeatureTest) => !t.optional
    && t.name === "unevaluatedItems"
    && ![
        // todo list
        "anchor",
        "defs",
        "dependentRequired",
        "id",
        "not",
        "recursiveRef",
        "ref",
        "refRemote",
        "vocabulary"
    ].includes(t.name)
const draftFeatureTests = getDraftTests("2019-09")
    .filter(supportedTestCases);

/*
~ dependentRequired
~ not
~ unevaluatedItems
~ unevaluatedProperties - expect for uncle-schema support
✓ additionalItems
✓ additionalProperties
✓ allOf
✓ anyOf
✓ boolean_schema
✓ const
✓ contains
✓ content
✓ default
✓ dependentSchemas
✓ enum
✓ exclusiveMaximum
✓ exclusiveMinimum
✓ format
✓ if-then-else
✓ infinite-loop-detection
✓ items
✓ maxContains
✓ maximum
✓ maxItems
✓ maxLength
✓ maxProperties
✓ minContains
✓ minimum
✓ minItems
✓ minLength
✓ minProperties
✓ multipleOf
✓ oneOf
✓ pattern
✓ patternProperties
✓ properties
✓ propertyNames
✓ required
✓ type
✓ uniqueItems
✓ unknownKeyword
✖ anchor
✖ defs
✖ id
✖ recursiveRef
✖ ref
✖ refRemote
✖ vocabulary - skipped evaluation of meta-schema
*/


const postponedTestcases = [
    // @todo vocabulary
    // we need to evaluate meta-schema for supported validation methods
    // we currently do not have the logic for this
    "schema that uses custom metaschema with with no validation vocabulary",
    // @todo unevaluatedProperties
    // https://stackoverflow.com/questions/66936884/deeply-nested-unevaluatedproperties-and-their-expectations
    // this tests expects knowledge of a parent-allOf statement
    // we currently do not have the logic for this
    "property is evaluated in an uncle schema to unevaluatedProperties",
    // @todo when recursiveRef is implemented
    "unevaluatedProperties with $recursiveRef",
    "unevaluatedItems with $recursiveRef",
    // @todo unevaluatedItems
    // https://stackoverflow.com/questions/66936884/deeply-nested-unevaluatedproperties-and-their-expectations
    // this tests expects knowledge of a parent-allOf statement
    // we currently do not have the logic for this
    "item is evaluated in an uncle schema to unevaluatedItems",
];


function runTestCase(tc: FeatureTest, skipTest: string[] = []) {
    describe(`${tc.name}${tc.optional ? " (optional)" : ""}`, () => {
        tc.testCases.forEach((testCase) => {
            // if (testCase.description !== "unevaluatedItems with if/then/else") {
            //     return;
            // }
            const schema = testCase.schema;
            if (skipTest.includes(testCase.description)) {
                console.log(`Unsupported '${testCase.description}'`);
                return;
            }

            describe(testCase.description, () => {
                testCase.tests.forEach((testData) => {
                    const test = skipTest.includes(testData.description) ? it.skip : it;

                    if (postponedTestcases.includes(testCase.description)) {
                        it.skip(testData.description, () => {});
                        return;
                    }

                    test(testData.description, () => {
                        const validator = new Draft2019(schema);
                        Object.assign(validator.remotes, cache.remotes);
                        const isValid = validator.isValid(testData.data);
                        expect(isValid).to.eq(testData.valid);
                    });
                });
            });
        });
    });
}

export default function runAllTestCases(skipTest: string[] = []) {
    describe("draft2019", () => {
        draftFeatureTests.forEach((testCase) => runTestCase(testCase, skipTest));
    });
}

runAllTestCases();
