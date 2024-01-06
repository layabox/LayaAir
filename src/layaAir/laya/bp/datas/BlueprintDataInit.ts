import { BPType, TBPCNode } from "./types/BlueprintTypes";

export const BlueprintDataList: TBPCNode[] = [
    {
        name: "printString",
        type: BPType.Function,
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
        name: "branch",
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
        input: [
            {
                name: "target",
                type: "object",
            }
        ],
    },
    {
        name: "waitTime",
        type: BPType.Function,
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
        name: "event_call",
        menuPath: "none",
        type: BPType.Function,
    },
]
