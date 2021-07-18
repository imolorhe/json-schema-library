export default {
    name: "refRemote",
    file: "refRemote.ts",
    optional: false,
    schemas: [
        {
            description: "remote ref",
            schema: { $ref: "http://localhost:1234/integer.json" },
            tests: [
                {
                    description: "remote ref valid",
                    data: 1,
                    valid: true,
                },
                {
                    description: "remote ref invalid",
                    data: "a",
                    valid: false,
                },
            ],
        },
        {
            description: "fragment within remote ref",
            schema: { $ref: "http://localhost:1234/subSchemas.json#/integer" },
            tests: [
                {
                    description: "remote fragment valid",
                    data: 1,
                    valid: true,
                },
                {
                    description: "remote fragment invalid",
                    data: "a",
                    valid: false,
                },
            ],
        },
        {
            description: "ref within remote ref",
            schema: {
                $ref: "http://localhost:1234/subSchemas.json#/refToInteger",
            },
            tests: [
                {
                    description: "ref within ref valid",
                    data: 1,
                    valid: true,
                },
                {
                    description: "ref within ref invalid",
                    data: "a",
                    valid: false,
                },
            ],
        },
        {
            description: "base URI change",
            schema: {
                $id: "http://localhost:1234/",
                items: {
                    $id: "baseUriChange/",
                    items: { $ref: "folderInteger.json" },
                },
            },
            tests: [
                {
                    description: "base URI change ref valid",
                    data: [[1]],
                    valid: true,
                },
                {
                    description: "base URI change ref invalid",
                    data: [["a"]],
                    valid: false,
                },
            ],
        },
        {
            description: "base URI change - change folder",
            schema: {
                $id: "http://localhost:1234/scope_change_defs1.json",
                type: "object",
                properties: {
                    list: { $ref: "#/definitions/baz" },
                },
                definitions: {
                    baz: {
                        $id: "baseUriChangeFolder/",
                        type: "array",
                        items: { $ref: "folderInteger.json" },
                    },
                },
            },
            tests: [
                {
                    description: "number is valid",
                    data: { list: [1] },
                    valid: true,
                },
                {
                    description: "string is invalid",
                    data: { list: ["a"] },
                    valid: false,
                },
            ],
        },
        {
            description: "base URI change - change folder in subschema",
            schema: {
                $id: "http://localhost:1234/scope_change_defs2.json",
                type: "object",
                properties: {
                    list: { $ref: "#/definitions/baz/definitions/bar" },
                },
                definitions: {
                    baz: {
                        $id: "baseUriChangeFolderInSubschema/",
                        definitions: {
                            bar: {
                                type: "array",
                                items: { $ref: "folderInteger.json" },
                            },
                        },
                    },
                },
            },
            tests: [
                {
                    description: "number is valid",
                    data: { list: [1] },
                    valid: true,
                },
                {
                    description: "string is invalid",
                    data: { list: ["a"] },
                    valid: false,
                },
            ],
        },
        {
            description: "root ref in remote ref",
            schema: {
                $id: "http://localhost:1234/object",
                type: "object",
                properties: {
                    name: { $ref: "name.json#/definitions/orNull" },
                },
            },
            tests: [
                {
                    description: "string is valid",
                    data: {
                        name: "foo",
                    },
                    valid: true,
                },
                {
                    description: "null is valid",
                    data: {
                        name: null,
                    },
                    valid: true,
                },
                {
                    description: "object is invalid",
                    data: {
                        name: {
                            name: null,
                        },
                    },
                    valid: false,
                },
            ],
        },
        {
            description: "remote ref with ref to definitions",
            schema: {
                $id: "http://localhost:1234/schema-remote-ref-ref-defs1.json",
                allOf: [{ $ref: "ref-and-definitions.json" }],
            },
            tests: [
                {
                    description: "invalid",
                    data: {
                        bar: 1,
                    },
                    valid: false,
                },
                {
                    description: "valid",
                    data: {
                        bar: "a",
                    },
                    valid: true,
                },
            ],
        },
    ],
};
