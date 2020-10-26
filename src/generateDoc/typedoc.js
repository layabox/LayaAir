#!/usr/bin/env node
// var td = require('./dist/lib/cli.js');
// new td.CliApplication();
const typedoc = require("typedoc");
const app = new typedoc.CliApplication();
app.bootstrap({
    mode: "modules",
    target: "ES6",
    out:"doc",
    module: "CommonJS",
    experimentalDecorators: true,
    excludePrivate:true,
    excludeProtected:true,
    hideGenerator:true,
    theme:"default",
    ignoreCompilerErrors:true,
    stripInternal:true,
    exclude:"node",
    tsconfig:"../layaAir/tsconfig.json",
    includes:"../layaAir"
});