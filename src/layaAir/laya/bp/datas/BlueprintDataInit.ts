import { BPType, TBPCNode } from "./types/BlueprintTypes";

export const BlueprintDataList: TBPCNode[] = [
    {
        name: "static_get",
        menuPath: "none",
        type: BPType.GetValue,
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: 'target',
                type: 'class',
            }
        ],
        output: [
            {
                type: "any",
            },
        ],
    },
    {
        name: "get_self",
        aliasName: "GetSelf",
        bpType: 'prop',
        type: BPType.GetValue,
        isSelf: true,
        modifiers: {
            isStatic: true,
            isReadonly: true,
        },
        output: [
            {
                name: 'self',
                type: "any",
            },
        ]
    },
    {
        name: "static_set",
        menuPath: "none",
        type: BPType.SetValue,
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
                type: 'class',
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
        name: "tmp_get",
        menuPath: "none",
        type: BPType.GetTmpValue,
        output: [
            {
                type: "any",
            },
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
        name: "tmp_set",
        menuPath: "none",
        type: BPType.SetTmpValue,
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
        name: "event_event",
        menuPath: "none",
        type: BPType.Event,
        output: [
            {
                name: "",
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
                name: "",
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
                name: "",
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
        name: "custom_static_fun",
        menuPath: "none",
        type: BPType.CustomFun,
        input: [
            {
                name: "execute",
                type: "exec",
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
        modifiers: {
            isStatic: true,
        },
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
        modifiers: {
            isStatic: true,
        },
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
                type: "new()=>T",
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
        name: "forEach",
        type: BPType.Block,
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
                name: "array",
                type: "array",
            },
        ],
        output: [
            {
                name: "loopBody",
                type: "exec",
            },
            {
                name: "element",
                type: "any",
            },
            {
                name: "index",
                type: "number",
            },
            {
                name: "completed",
                type: "exec",
            }
        ]
    },
    {
        name: "forEachWithBreak",
        type: BPType.Block,
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
                name: "array",
                type: "array",
            },
            {
                name: "break",
                type: "exec",
            }
        ],
        output: [
            {
                name: "loopBody",
                type: "exec",
            },
            {
                name: "element",
                type: "any",
            },
            {
                name: "index",
                type: "number",
            },
            {
                name: "completed",
                type: "exec",
            }
        ]
    },
    {
        name: "forLoop",
        type: BPType.Block,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "execute",
                type: "exec"
            },
            {
                name: "firstIndex",
                type: "number"
            },
            {
                name: "lastIndex",
                type: "number"
            },
            {
                name: "step",
                type: "number"
            }
        ],
        output: [
            {
                name: "loopBody",
                type: "exec",
            },
            {
                name: "index",
                type: "number",
            },
            {
                name: "completed",
                type: "exec",
            }
        ]
    },
    {
        name: "forLoopWithBreak",
        type: BPType.Block,
        menuPath: "system",
        modifiers: {
            isStatic: true,
        },
        input: [
            {
                name: "execute",
                type: "exec"
            },
            {
                name: "firstIndex",
                type: "number"
            },
            {
                name: "lastIndex",
                type: "number"
            },
            {
                name: "step",
                type: "number"
            },
            {
                name: "break",
                type: "exec"
            }
        ],
        output: [
            {
                name: "loopBody",
                type: "exec",
            },
            {
                name: "index",
                type: "number",
            },
            {
                name: "completed",
                type: "exec",
            }
        ]
    },
]
