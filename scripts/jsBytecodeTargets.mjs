// Only these performance-critical paths are inspected. Initialization wrappers,
// asset readers, debug rendering, and libraries not shipped by the build are
// deliberately excluded. Source-shape checks make renamed minified code visible.
// Recast is built and bytecode-checked in layabox/recastnavigation (laya/).
export const jsBytecodeTargets = [
    {
        file: "laya.Box2D.js",
        targets: [
            { label: "Box2D b2World.Step", exportName: "emscripten_bind_b2World_Step_3" },
            { label: "Box2D contact traversal", functionNames: ["__box2dCollideContacts"] },
            { label: "Box2D continuous collision solver", functionNames: ["__box2dSolveTOI"] },
        ],
    },
    {
        file: "physx.release.js",
        // Explicit generated kernels plus every manually extracted phase.
        // Contact-filtered regression scenes exercise lM, bda, ZL, qF and CX;
        // the other size-risk candidates are retained as fixed targets too.
        targets: [
            { label: "PhysX zW", functionNames: ["zW"] },
            { label: "PhysX Lha", functionNames: ["Lha"] },
            { label: "PhysX bda", functionNames: ["bda"] },
            { label: "PhysX vX", functionNames: ["vX"] },
            { label: "PhysX tX", functionNames: ["tX"] },
            { label: "PhysX rX", functionNames: ["rX"] },
            { label: "PhysX CF", functionNames: ["CF"] },
            { label: "PhysX lM", functionNames: ["lM"] },
            { label: "PhysX ER", functionNames: ["ER"] },
            { label: "PhysX cv", functionNames: ["cv"] },
            { label: "PhysX CX", functionNames: ["CX"] },
            { label: "PhysX Hu", functionNames: ["Hu"] },
            { label: "PhysX Tu", functionNames: ["Tu"] },
            { label: "PhysX ZL", functionNames: ["ZL"] },
            { label: "PhysX qF", functionNames: ["qF"] },
            ...Array.from({ length: 13 }, (_, index) => ({
                label: "PhysX zW phase " + (index + 1),
                functionNames: [`__physxzWPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 10 }, (_, index) => ({
                label: "PhysX Lha phase " + (index + 1),
                functionNames: [`__physxLhaPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 8 }, (_, index) => ({
                label: "PhysX bda phase " + (index + 1),
                functionNames: [`__physxbdaPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 10 }, (_, index) => ({
                label: "PhysX vX phase " + (index + 1),
                functionNames: [`__physxvXPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 8 }, (_, index) => ({
                label: "PhysX tX phase " + (index + 1),
                functionNames: [`__physxtXPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 7 }, (_, index) => ({
                label: "PhysX rX phase " + (index + 1),
                functionNames: [`__physxrXPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 6 }, (_, index) => ({
                label: "PhysX CF phase " + (index + 1),
                functionNames: [`__physxCFPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 7 }, (_, index) => ({
                label: "PhysX lM phase " + (index + 1),
                functionNames: [`__physxlMPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 6 }, (_, index) => ({
                label: "PhysX ER phase " + (index + 1),
                functionNames: [`__physxERPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 4 }, (_, index) => ({
                label: "PhysX cv phase " + (index + 1),
                functionNames: [`__physxcvPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 5 }, (_, index) => ({
                label: "PhysX CX phase " + (index + 1),
                functionNames: [`__physxCXPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 4 }, (_, index) => ({
                label: "PhysX Hu phase " + (index + 1),
                functionNames: [`__physxHuPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 4 }, (_, index) => ({
                label: "PhysX Tu phase " + (index + 1),
                functionNames: [`__physxTuPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 2 }, (_, index) => ({
                label: "PhysX ZL phase " + (index + 1),
                functionNames: [`__physxZLPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
            ...Array.from({ length: 2 }, (_, index) => ({
                label: "PhysX qF phase " + (index + 1),
                functionNames: [`__physxqFPhase${String(index + 1).padStart(2, "0")}`],
                bytecodeFilter: "__physx*",
            })),
        ],
    },
];
