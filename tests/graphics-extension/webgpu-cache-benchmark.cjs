// Binding-cache traversal only: GPU work and group creation are excluded from timing.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const filename = path.resolve(__dirname, '../../src/layaAir/laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBindGroupCache.ts');
const beforeIndex = process.argv.indexOf('--before');
if (beforeIndex < 0) throw new Error('Use --before <pre-review WebGPUBindGroupCache.ts>');
const beforeSource = fs.readFileSync(process.argv[beforeIndex + 1], 'utf8');
const afterSource = fs.readFileSync(filename, 'utf8');
function load(source) {
    const engine = {_instance: {gpuBufferMgr: {bufferResourceChangeEpoch: 0}}};
    const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
    const classes = ast.statements.filter(node => ts.isClassDeclaration(node)
        && ['WebGPUBindGroup', 'WebGPUBindGroupCache'].includes(node.name.text));
    const code = ts.transpileModule(classes.map(node=>node.getText(ast)).join('\n'), {
        compilerOptions: {target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS}
    }).outputText;
    const exports = {};
    new Function('exports','WebGPURenderEngine',code)(exports,engine);
    return {...exports,engine};
}
const variants = {before:load(beforeSource), after:load(afterSource)};
function run(variant, count) {
    const {WebGPUBindGroup:Group, WebGPUBindGroupCache:Cache,engine} = variants[variant];
    engine._instance.gpuBufferMgr.bufferResourceChangeEpoch = 0;
    const cache = new Cache(), tokens = [];
    let validations = 0;
    function validate() { validations++; return Group.prototype.isValid.call(this); }
    for(let i=0;i<count+16;i++) {
        const token = {value:0}, group = new Group({});
        group.bufferRefs.push({token,ver:0}); group.isValid=validate;
        cache.bindGroupCache.set(i,group); tokens.push(token);
    }
    const started=performance.now();
    if(variant==='before') {
        for(let i=0;i<count;i++) {
            tokens[i].value++; engine._instance.gpuBufferMgr.bufferResourceChangeEpoch++;
            cache.clearInvalidGroups();
        }
    } else {
        for(let i=0;i<count;i++) {
            tokens[i].value++; engine._instance.gpuBufferMgr.bufferResourceChangeEpoch++;
            cache.requestInvalidGroupsCleanup();
        }
        cache.clearInvalidGroups();
    }
    const elapsedMs=performance.now()-started;
    assert.equal(cache.bindGroupCache.size,16);
    assert.equal(validations,variant==='before'?count*(count+1)/2+16*count:count+16);
    return {elapsedMs,validations};
}
const results={node:process.version,target:'ES2017',scope:'CPU binding-cache cleanup only; creation and GPU work excluded',
    beforeSHA256:crypto.createHash('sha256').update(beforeSource).digest('hex'),
    afterSHA256:crypto.createHash('sha256').update(afterSource).digest('hex'),cases:{}};
for(const count of [1000,5000]) {
    run('before',count);run('after',count);
    const before=[],after=[];
    for(let i=0;i<9;i++)for(const name of i%2?['after','before']:['before','after'])
        (name==='before'?before:after).push(run(name,count));
    const median=values=>values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)];
    results.cases[count]={beforeMedianMs:median(before.map(r=>r.elapsedMs)),afterMedianMs:median(after.map(r=>r.elapsedMs)),
        beforeValidations:before[0].validations,afterValidations:after[0].validations,before,after};
}
console.log(JSON.stringify(results,null,2));
