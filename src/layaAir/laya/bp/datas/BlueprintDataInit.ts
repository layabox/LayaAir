import { BPType, TBPCNode } from "./types/BlueprintTypes";

export const BlueprintDataList: TBPCNode[] = [
    {
        name: "printString",
        type: BPType.Function,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "str",
                type: "string",
            }
        ],
    },
    {
        name: "get",
        menuPath: "none",
        type: BPType.GetValue,
        input: [
            {
                name: 'target',
                type: 'any',
            }
        ],
        output: [
            {
                type: "any",
            },
        ],
    },
    {
        name: "set",
        menuPath: "none",
        type: BPType.SetValue,
        input: [
            {
                name: "execute",
                type: "exec",
            },
            {
                name: 'target',
                type: 'any',
            },
            {
                name: 'set',
                type: "any",
            },
        ],
        output: [
            {
                name: "then",
                type: "exec"
            },
            {
                name: "return",
                type: "any",
            }
        ],
    },
    {
        name: "add",
        type: BPType.Operator,
        menuPath: "system",
        typeParameters: {
            T: { extends: ["string", "number"] }
        },
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                type: "T",
            },
            {
                type: "T",
            },
        ],
        output: [
            {
                type: "T",
            },
        ]
    },
    {
        name: "branch",
        type: BPType.Branch,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "execute",
                type: "exec",
            },
            {
                name: "condition",
                type: "boolean",
            },
        ],
        output: [
            {
                name: "true",
                type: "exec",
            },
            {
                name: "false",
                type: "exec",
            },
        ]
    },
    {
        name: "sequence",
        type: BPType.Sequence,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "execute",
                type: "exec",
            }
        ],
        output: [
            {
                name: "then0",
                type: "exec",
            },
            {
                name: "then1",
                type: "exec",
            },
        ]
    },
    {
        name: "test",
        type: BPType.Function,
        menuPath: "system",
        input: [
            {
                name: "target",
                type: "object",
            }
        ],
    },
    {
        name: "equal",
        type: BPType.Operator,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                type: "number",
            },
            {
                type: "number",
            },
        ],
        output: [
            {
                type: "number",
            },
        ]
    },
    {
        name: "waitTime",
        type: BPType.Function,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "second",
                type: "number",
            }
        ],
    },
    // {
    //     name: "makeVector3",
    //     type: BPType.NewTarget,
    //     target: "Vector3",
    //     input: [
    //         {
    //             name: "x",
    //             type: "number",
    //         },
    //         {
    //             name: "y",
    //             type: "number",
    //         },
    //         {
    //             name: "z",
    //             type: "number",
    //         }
    //     ],
    //     output: [
    //         {
    //             name: "return",
    //             type: "Vector3"
    //         }
    //     ]
    // },
    {
        name: "event_event",
        menuPath: "none",
        type: BPType.Event,
        output: [
            {
                name: "event",
                type: "bpFun"
            },
            {
                name: "then",
                type: "exec"
            },
        ]
    },
    {
        name: "event_on",
        menuPath: "none",
        type: BPType.Function,
        input: [
            {
                name: "event",
                type: "bpFun"
            }
        ]
    },
    {
        name: "event_off",
        menuPath: "none",
        type: BPType.Function,
        input: [
            {
                name: "event",
                type: "bpFun"
            }
        ]
    },
    {
        name: "event_offAll",
        menuPath: "none",
        type: BPType.Function,
    },
    {
        name: "event_call",
        menuPath: "none",
        type: BPType.Function,
    },
    {
        name: "custom_fun_start",
        menuPath: "none",
        type: BPType.CustomFunStart,
        output: [
            {
                name: "then",
                type: "exec"
            },
        ]
    },
    {
        name: "custom_fun_return",
        menuPath: "none",
        type: BPType.CustomFunReturn,
        input: [
            {
                name: "execute",
                type: "exec",
            }
        ]
    },
    {
        name: "custom_fun",
        menuPath: "none",
        type: BPType.CustomFun,
        input: [
            {
                name: "execute",
                type: "exec",
            },
            {
                name: "target",
                type: "object",
            },
        ],
        output: [
            {
                name: "then",
                type: "exec"
            },
        ]
    },
    {
        name: "expression",
        menuPath: "system",
        type: BPType.Pure,
        input: [
            {
                name: 'caller',
                type: 'any',
            },
            {
                name: "str",
                type: "string",
            }
        ],
        output: [
            {
                type: "any",
            },
        ],
    },
    {
        name: "as",
        menuPath: "system",
        type: BPType.Assertion,
        typeParameters: {
            T: {}
        },
        input: [
            {
                name: 'target',
                type: 'any',
            },
            {
                name: "type",
                type: "new()=>T",
            }
        ],
        output: [
            {
                name: "then",
                type: "T",
            },
        ],
    },
    {
        name: "instanceof",
        menuPath: "system",
        type: BPType.Branch,
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "execute",
                type: "exec",
            },
            {
                name: 'target',
                type: 'any',
            },
            {
                name: "type",
                type: "Class",
            },
        ],
        output: [
            {
                name: "true",
                type: "exec",
            },
            {
                name: "false",
                type: "exec",
            },
        ]
    },
]
