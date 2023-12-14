import { BPType, TBPCNode } from "./types/BlueprintTypes";

export const BlueprintDataList: TBPCNode[] = [
    {
        name: "printString",
        type: BPType.Function,
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
        name: "sequnece",
        type: BPType.Sequnece,
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
        input: [
            {
                name: "second",
                type: "number",
            }
        ],
    },
    {
        name:"makeVector3",
        type:BPType.NewTarget,
        target:"Vector3",
        input: [
            {
                name: "x",
                type: "number",
            },
            {
                name: "y",
                type: "number",
            },
            {
                name: "z",
                type: "number",
            }
        ],
        output: [
            {
                name: "return",
                type: "Vector3"
            }
        ]
    }
]
