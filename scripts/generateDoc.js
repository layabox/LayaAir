#!/usr/bin/env node
// var td = require('./dist/lib/cli.js');
// new td.CliApplication();
const typedoc = require("typedoc");
const app = new typedoc.Application();
app.bootstrap({
    out: "../src/doc",
    entryPointStrategy: "Expand",
    entryPoints: ["../src/layaAir/"], // 入口文件或目录
    excludePrivate: true,
    excludeProtected: true,
    hideGenerator: true,
    theme: "default",
    exclude: "node",
    tsconfig: "../src/layaAir/tsconfig.json",
    includes: "../src/layaAir/",
});