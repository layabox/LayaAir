import fs from "node:fs";
import vm from "node:vm";

// Only compile. In particular, do not evaluate third-party library initializers.
const file = process.argv[2];
const source = fs.readFileSync(file, "utf8");
fs.writeSync(1, "\n__LAYA_BYTECODE_BEGIN__\n");
if (file.endsWith(".mjs"))
    new vm.SourceTextModule(source, { identifier: file });
else
    new vm.Script(source, { filename: file });
fs.writeSync(1, `\n__LAYA_BYTECODE_END__ V8=${process.versions.v8}\n`);
