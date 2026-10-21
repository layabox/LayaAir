import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inspectJsBytecode, warnJsBytecode } from "../../scripts/checkJsBytecode.mjs";

test("checks only fixed targets without evaluating initialization code", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "laya-bytecode-"));
    try {
        const file = path.join(directory, "library.js");
        const body = 'x += Math.sin(x);\n'.repeat(100);
        await fs.writeFile(file, 'throw new Error("MUST NOT EXECUTE");\n'
            + `function init(x) { ${body}return x; }\nfunction hot(x) { ${body}return x; }\n`
            + 'function tiny() { return 1; }\nvar exports = { exportedStep: hot };');
        const options = { maxBytecodeSize: 100,
            targets: [{ label: "Step", exportName: "exportedStep" }, { label: "Tiny", functionNames: ["tiny"] }] };
        const result = await inspectJsBytecode(file, options);
        assert.ok(result.v8);
        assert.deepEqual(result.missingTargets, []);
        assert.equal(result.checks.length, 2);
        assert.deepEqual(result.warnings.map(item => item.functionName), ["hot"]);
        const messages = [];
        await warnJsBytecode([file, file], { ...options, warn: message => messages.push(message) });
        assert.equal(messages.length, 1);
        assert.match(messages[0], /Step \(function hot\)/);
        assert.ok(!messages[0].includes("function init"));
        assert.deepEqual((await inspectJsBytecode(file)).checks, []);
    }
    finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test("validates known minified aliases and warns when a target changes", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "laya-bytecode-"));
    try {
        const file = path.join(directory, "library.mjs");
        await fs.writeFile(file, 'export function Kg(x) { return x; }\nexport function Jg(x) {\n'
            + 'x += Math.sin(x);\n'.repeat(100) + 'return x; }');
        const targets = [{ label: "Core", functionNames: ["Kg", "Jg"], minSourceLength: 1000 }];
        const result = await inspectJsBytecode(file, { maxBytecodeSize: 100, targets });
        assert.equal(result.warnings[0].functionName, "Jg");
        const messages = [];
        await warnJsBytecode([file], { targets: [{ label: "Missing", functionNames: ["renamed"] }],
            warn: message => messages.push(message) });
        assert.equal(messages.length, 1);
        assert.match(messages[0], /target Missing: function missing/);
        const invalid = path.join(directory, "invalid.js");
        await fs.writeFile(invalid, 'function hot() { return 1; }\nfunction {');
        const errors = [];
        await warnJsBytecode([invalid], { targets: [{ label: "Hot", functionNames: ["hot"] }],
            warn: message => errors.push(message) });
        assert.equal(errors.length, 1);
        assert.match(errors[0], /unable to inspect/);
    }
    finally { await fs.rm(directory, { recursive: true, force: true }); }
});


test("qualifies runtime methods by class instead of warning about every apply method", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "laya-bytecode-"));
    try {
        const file = path.join(directory, "runtime.js");
        const source = 'class ResourceLoader { apply(x) { ' + 'x += Math.sin(x);'.repeat(150)
            + 'return x; } } class AnimationState { apply(x) { ' + 'x += Math.sin(x);'.repeat(100)
            + 'return x; } }';
        await fs.writeFile(file, source);
        const result = await inspectJsBytecode(file, { maxBytecodeSize: 100,
            targets: [{ label: "Animation update", className: "AnimationState", methodName: "apply" }] });
        assert.deepEqual(result.missingTargets, []);
        assert.equal(result.checks.length, 1);
        assert.equal(result.warnings.length, 1);
        assert.equal(result.warnings[0].label, "Animation update");
        assert.ok(result.warnings[0].column > source.indexOf('class AnimationState'));
        assert.equal(await fs.readFile(file, "utf8"), source);
    }
    finally { await fs.rm(directory, { recursive: true, force: true }); }
});


test("shared bytecode filters still report only fixed functions", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "laya-bytecode-"));
    try {
        const file = path.join(directory, "library.js");
        const body = 'x += Math.sin(x);'.repeat(100);
        await fs.writeFile(file, 'throw new Error("MUST NOT EXECUTE");\n'
            + ['hot_a', 'hot_b', 'hot_unwatched'].map(name => `function ${name}(x) { ${body}return x; }`).join('\n'));
        const targets = ['hot_a', 'hot_b'].map(name => ({ label: name, functionNames: [name], bytecodeFilter: 'hot_*' }));
        const result = await inspectJsBytecode(file, { maxBytecodeSize: 100, targets });
        assert.deepEqual(result.missingTargets, []);
        assert.deepEqual(result.checks.map(item => item.functionName), ['hot_a', 'hot_b']);
        assert.deepEqual(result.warnings.map(item => item.functionName), ['hot_a', 'hot_b']);
        const missing = await inspectJsBytecode(file, { targets: [{...targets[0], bytecodeFilter: 'absent_*'}] });
        assert.equal(missing.missingTargets.length, 1);
    }
    finally { await fs.rm(directory, { recursive: true, force: true }); }
});
