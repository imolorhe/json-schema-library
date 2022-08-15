/* eslint max-len: 0 */
import { expect } from "chai";
import chalk from "chalk";
import Draft04 from "../../../lib/cores/Draft04";
import addSchema from "../../../lib/addSchema";
import { addRemotes } from "../utils/addRemotes";
import { getDraftTests, FeatureTest } from "../../getDraftTests";
import draft04 from "../../../remotes/draft04.json";

addRemotes(addSchema);
addSchema("http://json-schema.org/draft-04/schema", draft04);

/*
ref relative refs with absolute uris and defs invalid on inner field:
RangeError: Maximum call stack size exceeded
 */

const supportedTestCases = (t) =>
    t.optional
        ? ![
              "ecmascript-regex",
              "format-date-time",
              "non-bmp-regex",
              "zeroTerminatedFloats",
              "float-overflow"
          ].includes(t.name)
        : true;
const draftFeatureTests = getDraftTests("4")
    // .filter(testcase => testcase.name === "float-overflow")
    .filter(supportedTestCases);

function runTestCase(Core, tc: FeatureTest, skipTest = []) {
    describe(`${tc.name}${tc.optional ? " (optional)" : ""}`, () => {
        tc.testCases.forEach((testCase) => {
            const schema = testCase.schema;
            if (skipTest.includes(testCase.description)) {
                console.log(chalk.red(`Unsupported '${testCase.description}'`));
                return;
            }

            describe(testCase.description, () => {
                testCase.tests.forEach((testData) => {
                    const test = skipTest.includes(testData.description) ? it.skip : it;

                    test(testData.description, () => {
                        const validator = new Core(schema);
                        const isValid = validator.isValid(testData.data);
                        expect(isValid).to.eq(testData.valid);
                    });
                });
            });
        });
    });
}

export default function runAllTestCases(Core, skipTest = []) {
    describe("draft04", () => {
        draftFeatureTests.forEach((testCase) => runTestCase(Core, testCase, skipTest));
    });
}

runAllTestCases(Draft04);
