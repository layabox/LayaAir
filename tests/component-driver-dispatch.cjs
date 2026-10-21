const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const path = require('node:path');
const filename = process.argv[2] || path.resolve(__dirname, '../src/layaAir/laya/components/ComponentDriver.ts');
const results = [];
const mutationResults = [];
for (const variant of ['before', 'candidate']) {
    const source = fs.readFileSync(filename, 'utf8');
    const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS}}).outputText;
    const exports = {}, times = [];
    vm.runInNewContext(code, {exports, console, performance: {now: () => 1}, require: () => ({
        LayaGL: {statAgent: {recordTimeData: (...args) => times.push(args)}},
        StatElement: {T_ScriptUpdateTime: 1, T_ScriptLateUpdateTime: 2}
    })});
    // The previous live Set traversal is the reference for membership mutation.
    if (variant === 'before') {
        const Driver = exports.ComponentDriver;
        const phases = [['Update','_onUpdates'],['LateUpdate','_onLateUpdates'],['AfterSceneUpdate','_onAfterSceneUpdates'],['PreRender','_onPreRenders'],['PostRender','_onPostRenders']];
        exports.ComponentDriver = class extends Driver {
            constructor() { super(); for (const [, field] of phases) this[field] = new Set(); }
        };
        for (const [suffix, field] of phases) exports.ComponentDriver.prototype['call' + suffix] = function () {
            for (const component of this[field]) if (component._status == 3) {
                try { component['on' + suffix](); } catch (error) { this.onError(error); }
            }
            if (suffix === 'Update' || suffix === 'LateUpdate') times.push([]);
        };
    }
    for (const suffix of ['Update', 'LateUpdate', 'AfterSceneUpdate', 'PreRender', 'PostRender']) {
        const driver = new exports.ComponentDriver(), calls = [], errors = [];
        const event = 'on' + suffix, dispatch = 'call' + suffix;
        driver.onError = error => errors.push(error);
        const make = name => ({_status: 3, [event]() { assert.equal(this.name, name); calls.push(name); }, name});
        const first = make('first'), removed = make('removed'), paused = make('paused'), tail = make('tail'), added = make('added');
        first[event] = function () {
            calls.push(this.name); driver.remove(removed); paused._status = 2; driver.add(added);
        };
        tail[event] = function () {calls.push(this.name); throw 'expected';};
        for (const item of [first, removed, paused, tail]) driver.add(item);
        driver[dispatch]();
        assert.deepEqual(calls, ['first', 'tail', 'added']);
        assert.deepEqual(errors, ['expected']);
        const nested = new exports.ComponentDriver(), nestedCalls = []; let inside = false;
        nested.add({_status: 3, [event]() {
            nestedCalls.push('a'); if (!inside) {inside = true; nested[dispatch]();}
        }});
        const other = {_status: 3, [event]() {nestedCalls.push('b');}};
        nested.add(other);
        nested[dispatch]();
        assert.deepEqual(nestedCalls, ['a', 'a', 'b', 'b']);
        // Remove/reinsert an already visited entry once: both live Set traversals revisit it.
        const revisit = new exports.ComponentDriver(), seen = []; let replaced = false;
        const a = {_status: 3, [event]() {seen.push('a');}};
        const b = {_status: 3, [event]() {
            seen.push('b'); if (!replaced) {replaced = true; revisit.remove(a); revisit.add(a);}
        }};
        revisit.add(a); revisit.add(b); revisit[dispatch]();
        assert.deepEqual(seen, ['a', 'b', 'a']);
        const throwing = new exports.ComponentDriver();
        throwing.onError = () => {throw 'handler';};
        throwing.add({_status: 3, [event]() {throw 'callback';}});
        assert.throws(() => throwing[dispatch](), error => error === 'handler');
        results.push(`${variant}:${suffix}`);
    }
    assert.equal(times.length, 8);
    const variantTraces=[];
    for(const [suffix,field] of [['Update','_onUpdates'],['LateUpdate','_onLateUpdates'],['AfterSceneUpdate','_onAfterSceneUpdates'],['PreRender','_onPreRenders'],['PostRender','_onPostRenders']]) {
        const driver=new exports.ComponentDriver(), trace=[];
        const event='on'+suffix,dispatch='call'+suffix;
        let seed=73191, round=0, nested=false;
        const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
        const touched=new Set();
        const nodes=Array.from({length:16},(_,name)=>({_status:3,name,[event]() {
            trace.push([round,this.name]);
            if(touched.has(this.name))return;
            touched.add(this.name);
            const target=nodes[random()%nodes.length],operation=random()%9;
            if(operation===0)driver.remove(target);
            else if(operation===1)driver.add(target);
            else if(operation===2){driver.remove(target);driver.add(target);}
            else if(operation===3)target._status=target._status===3?2:3;
            else if(operation===4&&!nested){nested=true;driver[dispatch]();}
            else if(operation===5)throw 'callback';
            else if(operation===6){driver[field].clear();driver.add(target);}
        }}));
        driver.onError=error=>{trace.push(['error',error]);if(round%11===0)throw 'handler';};
        for(const node of nodes)driver.add(node);
        for(round=0;round<80;round++) {
            touched.clear();nested=false;
            for(let i=0;i<3;i++){const node=nodes[random()%nodes.length];if(random()&1)driver.add(node);else driver.remove(node);}
            try {driver[dispatch]();}catch(error){assert.equal(error,'handler');trace.push(['escape']);}
            trace.push(['members',...Array.from(driver[field],node=>node.name)]);
        }
        variantTraces.push(trace);
    }
    mutationResults.push(variantTraces);
}
assert.deepEqual(mutationResults[1],mutationResults[0]);
console.log('Component lifecycle live mutation, this, exceptions, reentry, reinsertion and timing PASS:', results.length);
console.log('Five callback phases x 80 deterministic mutation/reentry/clear/error passes match original Set dispatch.');
