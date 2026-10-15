// node tests/physics/recast-regression.cjs [source.js] [baseline-result.json] [--build-benchmark]
// Defaults to the checked-in pre-optimization behavior fixture.
// Also runnable with ELECTRON_RUN_AS_NODE=1 to test the target Chromium/V8.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const args = process.argv.slice(2).filter(arg => arg !== '--build-benchmark');
const benchmarkBuild = process.argv.includes('--build-benchmark');
const sourcePath = args[0] || path.join(__dirname, '../../src/layaAir/jsLibs/recast-navigation.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const specs = [
    { name: 'plane', width: 8, partition: 0 },
    { name: 'obstacle-watershed', width: 16, hole: 'center', partition: 0 },
    { name: 'obstacle-monotone', width: 16, hole: 'center', partition: 1 },
    { name: 'obstacle-layers', width: 16, hole: 'center', partition: 2 },
    { name: 'disconnected', width: 16, hole: 'gap', partition: 0 },
    { name: 'offmesh-link', width: 16, hole: 'gap', link: true, partition: 0 },
];
function grid(spec) {
    const vertices = [], indices = [], flags = [];
    for (let z = 0; z < 8; z++) for (let x = 0; x < spec.width; x++) {
        if ((spec.hole === 'center' && x >= 7 && x < 9 && z >= 3 && z < 5)
            || (spec.hole === 'gap' && x >= 7 && x < 9)) continue;
        const height = xx => xx > 12 ? (xx - 12) * .1 : 0;
        const base = vertices.length / 3;
        vertices.push(x,height(x),z, x,height(x),z+1, x+1,height(x+1),z, x+1,height(x+1),z+1);
        indices.push(base,base+1,base+2, base+2,base+1,base+3);
        flags.push(x >= 12 ? 2 : 1, x >= 12 ? 2 : 1);
    }
    return { vertices: new Float32Array(vertices), indices: new Uint32Array(indices), flags: new Uint8Array(flags) };
}
function plain(value) {
    if (ArrayBuffer.isView(value)) return Array.from(value);
    if (Array.isArray(value)) return Array.from(value,plain);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, plain(value[key])]));
    return value;
}
async function scenario(spec) {
    const diagnostics = [];
    let seed = 123456789;
    const randomMath = Object.create(Math);
    randomMath.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const context = { window: {}, Math: randomMath, performance, setTimeout, clearTimeout,
        console: Object.fromEntries(['log','info','warn','error'].map(level => [level, (...args) => diagnostics.push([level, args.map(String)])])) };
    vm.runInNewContext(source, context, { filename: sourcePath });
    const m = await context.Recast();
    const nav = new m.dtNavMesh();
    nav.init([0,-1,0], [spec.width,3,8], .25, 32);
    const mesh = grid(spec), data = new m.dtNavTileData();
    data.setTriVertex(mesh.vertices); data.setTriIndex(mesh.indices); data.setTriFlag(mesh.flags);
    const cache = new m.dtNavTileCache(); cache.init(data);
    const links = new m.dtOffMeshConnection(), volumes = new m.dtConvexVolume();
    if (spec.link) links.addOffMeshConnection(7, [6,.2,4], [10,.2,4], .6, 1, 1);
    const config = { cellSize:.25, cellHeight:.2, tileSize:32, agentMaxSlope:45,
        agentHeight:1.8, agentMaxClimb:.3, agentRadius:.2 };
    let buildMs = 0;
    function addTile(tx) {
        const tile = { tx,ty:0,bmin:[tx*8,-1,0],bmax:[(tx+1)*8,3,8],agentHeight:1.8,
            agentRadius:.2,agentMaxClimb:.3,maxEdgeLen:12,maxSimplificationError:.9,partitionType:spec.partition };
        const start = performance.now();
        nav.addTile(config, tile, [cache.$$.ptr], links, volumes);
        buildMs += performance.now() - start;
    }
    for (let tx = 0; tx < spec.width/8; tx++) addTile(tx);
    const query = new m.dtNavMeshQuery(); query.init(nav,2048);
    const filter = new m.dtQueryFilter();
    const extents = [1,4,1];
    function find(start, end) {
        const a = plain(query.findNearestPoly(start,extents,filter));
        const b = plain(query.findNearestPoly(end,extents,filter));
        const route = plain(query.findPath(a,b,filter,256));
        let straight = null;
        if (route.polys.length) {
            const raw = query.findStraightPath(a.data,b.data,route.polys,route.polys.length,256);
            // Only nsteerPath entries are initialized; the remaining capacity is scratch memory.
            straight = { nsteerPath: raw.nsteerPath, steerPath: Array.from(raw.steerPath).slice(0,raw.nsteerPath*3) };
        }
        const height = route.polys.length ? plain(query.getPolyHeight(route.polys[0],a.data)) : null;
        return { a,b,route,straight,height };
    }
    const paths = [find([1,0,1],[spec.width-1,0,7]), find([1,0,7],[spec.width-1,0,1]),
        find([1,0,1],[2,0,2]), find([spec.width-2,0,1],[spec.width-1,0,7])];
    assert.ok(paths[2].route.polys.length > 0, `${spec.name}: local path must exist`);
    assert.ok(paths[2].straight.nsteerPath > 0, `${spec.name}: straight path must be exercised`);
    filter.setAreaCost(1,2.5); filter.setAreaCost(2,4);
    paths.push(find([1,0,1],[spec.width-1,0,7]));
    filter.setExcludeFlags(0xffff);
    paths.push(plain(query.findNearestPoly([1,0,1],extents,filter)));
    filter.setExcludeFlags(0); filter.setAreaCost(1,1); filter.setAreaCost(2,1);
    if (benchmarkBuild) {
        // Separate warmup from the measured 100 runtime tile rebuilds.
        for (let i=0;i<20;i++) { nav.removeTile(0,0); addTile(0); }
        const queries=crypto.createHash('sha256'), begin=performance.now();
        for (let i=0;i<100;i++) {
            nav.removeTile(0,0); addTile(0);
            queries.update(JSON.stringify(find([1,0,1],[spec.width-1,0,7])));
        }
        return {name:spec.name,queryHash:queries.digest('hex'),timing:{rebuilds:100,ms:performance.now()-begin}};
    }
    const crowd = new m.dtCrowd(); crowd.init(32,.5,nav);
    const params = new m.dtCrowdAgentParams();
    Object.assign(params,{ radius:.2,height:1.8,maxAcceleration:8,maxSpeed:2,collisionQueryRange:2,
        pathOptimizationRange:8,updateFlags:31,obstacleAvoidanceType:2,queryFilterType:0,separationWeight:2 });
    const ids = [], commands = [], initialPositions = [];
    assert.ok(Array.from(m.updateCrowd(crowd,0)).every(value => value === 0), 'empty Crowd output');
    for (let i = 0; i < 24; i++) {
        const x = i%2 ? spec.width-1-(i%3)*.45 : 1+(i%3)*.45, z = 1+Math.floor(i/4)*.9;
        const nearest = query.findNearestPoly(spec.link && i===0 ? [6,0,4] : [x,0,z],extents,filter);
        const id = crowd.addAgent(nearest.data,params); assert.ok(id >= 0);
        ids.push(id); initialPositions.push(nearest.data);
        const target = query.findNearestPoly(spec.link && i===0 ? [10.5,0,4] : [i%2?1:spec.width-1,0,7-z],extents,filter);
        commands.push(crowd.requestMoveTarget(id,target));
    }
    const positions = crypto.createHash('sha256'), states = crypto.createHash('sha256');
    const checkpoints = []; let updateMs = 0, advanced = 0, offmeshFrames = 0;
    for (let frame = 0; frame < 480; frame++) {
        if (frame === 120) for (const id of ids.slice(0,4)) commands.push(crowd.requestMoveVelocity(id,[.5,0,-.2]));
        if (frame === 180) for (const id of ids) {
            const target = query.findNearestPoly([spec.width/2,0,1.5],extents,filter);
            commands.push(crowd.requestMoveTarget(id,target));
        }
        if (frame === 240) { const id = ids.pop(); crowd.removeAgent(id); commands.push(['remove',id]); }
        if (frame === 260) { const id = crowd.addAgent(paths[2].a.data,params); ids.push(id);
            commands.push(['add',id,crowd.requestMoveTarget(id,paths[0].b)]); }
        if (frame === 300) { const active = crowd.getAgent(ids[0]).getparams(); active.updateFlags=0; active.maxSpeed=1; }
        const dt = frame%29===0 ? 0 : frame%3===0 ? 1/30 : 1/60;
        const start = performance.now(), rawValues = m.updateCrowd(crowd,dt);
        updateMs += performance.now() - start;
        // The module returns a borrowed heap view. Snapshot it before another native call.
        const values = Float32Array.from(rawValues);
        assert.ok(Array.from(values).every(Number.isFinite), `${spec.name}: non-finite Crowd output`);
        positions.update(Buffer.from(values.buffer,values.byteOffset,values.byteLength));
        const status = ids.map(id => { const agent = crowd.getAgent(id);
            return [id,agent.active,agent.state,agent.targetState,agent.targetRef]; });
        states.update(JSON.stringify(status));
        if (status.some(agent => agent[2]===2)) offmeshFrames++;
        if (frame%120===119) checkpoints.push({frame,values:Array.from(values.slice(0,24)),status:plain(status.slice(0,4))});
        if (frame===119) advanced=Math.hypot(values[0]-initialPositions[0][0],values[2]-initialPositions[0][2]);
    }
    assert.ok(advanced > .05, `${spec.name}: agents must actually move`);
    if (spec.link) assert.ok(offmeshFrames > 0, 'Crowd must traverse the off-mesh link');
    const finalPaths = [find([1,0,1],[spec.width-1,0,7])];
    // Removing and rebuilding a populated tile exercises failure/cleanup and salted refs.
    nav.removeTile(0,0);
    finalPaths.push(plain(query.findNearestPoly([1,0,1],extents,filter)));
    addTile(0);
    finalPaths.push(find([1,0,1],[spec.width-1,0,7]));
    return { name:spec.name, paths,commands,positionHash:positions.digest('hex'),stateHash:states.digest('hex'),
        checkpoints,offmeshFrames,finalPaths,diagnostics, timing:{buildMs:+buildMs.toFixed(3),updateMs:+updateMs.toFixed(3)} };
}
(async()=>{
    const cases=[]; for(const spec of specs) cases.push(await scenario(spec));
    const result={node:process.versions.node,electron:process.versions.electron,v8:process.versions.v8,cases};
    if (!benchmarkBuild || args[1]) {
        const baselinePath = args[1] || path.join(__dirname,'recast-behavior.json');
        const baseline = JSON.parse(fs.readFileSync(baselinePath,'utf8'));
        const behavior = rows => rows.map(({timing,...rest}) => rest);
        if (baseline.cases[0].behaviorHash) {
            const signatures = behavior(result.cases).map(item => ({ name:item.name,
                positionHash:item.positionHash, stateHash:item.stateHash,
                behaviorHash:crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex') }));
            assert.deepEqual(signatures,baseline.cases,'Recast path/Crowd behavior changed');
        } else {
            assert.deepEqual(behavior(result.cases),behavior(baseline.cases),'Recast path/Crowd behavior changed');
        }
    }
    console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1});
