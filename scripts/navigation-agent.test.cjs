const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '../src/layaAir/laya/navigation');
class Vector {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    cloneTo(out) { Object.assign(out, this); }
}
let BaseNavAgent;
const warnings = [];
function load(file) {
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
    }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, console: { warn: message => warnings.push(message) }, require(name) {
        const key = path.basename(name);
        if (key === 'BaseNavAgent') return { BaseNavAgent };
        if (key === 'Component') return { Component: class { _onEnable() {} _onDisable() {} } };
        if (['Vector2', 'Vector3', 'Quaternion'].includes(key)) return { [key]: Vector };
        if (key === 'NavAgentLinkAnim') return { NavAgentLinkAnim: class {} };
        if (key === 'AreaMask') return { AreaMask: class { flag = 3; _setAreaMap() {} } };
        if (key === 'NavigationConfig') return { ObstacleAvoidanceType: { MedQuality: 2 }, UpdateFlags: {} };
        if (key === 'Navgiation2DUtils') return { Navgiation2DUtils: {
            _vec2ToVec3(v, out) { Object.assign(out, { x: v.x, y: 0, z: v.y }); },
        } };
        return {};
    } });
    return module.exports;
}
BaseNavAgent = load('common/component/BaseNavAgent.ts').BaseNavAgent;
const { Nav2DAgent } = load('2D/component/Nav2DAgent.ts');
const { NavAgent } = load('3D/component/NavAgent.ts');

test('navigation acceleration defaults match the serialized default contract', () => {
    assert.equal(new BaseNavAgent().maxAcceleration, 10);
    assert.equal(new NavAgent().maxAcceleration, 10);
    assert.equal(new Nav2DAgent().maxAcceleration, 10);
});
for (const Agent of [NavAgent, Nav2DAgent]) {
    test(`${Agent.name} updates the bound crowd acceleration independently of speed`, () => {
        const a = new Agent();
        a.maxAcceleration = 42;
        assert.equal(a.maxAcceleration, 42);
        const params = {};
        a._crowAgent = { getparams: () => params };
        a.speed = 100;
        for (const value of [1, 1000, 0]) {
            a.maxAcceleration = value;
            assert.equal(a.maxAcceleration, value);
            assert.equal(params.maxAcceleration, value);
            assert.equal(params.maxSpeed, 100);
        }
    });
    test(`${Agent.name} ignores targets outside navigation surfaces and accepts the next valid target`, () => {
        const a = new Agent();
        let moves = 0, links = 0;
        const surface = { id: 1, enabled: true, _navMesh: { _requestMoveTarget() { moves++; } } };
        let targetSurface = null;
        a._currentNaveSurface = surface;
        a._navManager = {
            getNavMeshSurface: () => targetSurface,
            getNavMeshLink(from, to) { assert.ok(to, 'null surfaces must not reach link lookup'); links++; return null; },
        };
        const target = Agent === Nav2DAgent ? new Vector(100, 0) : new Vector(100, 0, 0);
        a.destination = target;
        assert.equal(moves, 0);
        assert.equal(links, 0);
        targetSurface = surface;
        a.destination = target;
        assert.equal(moves, 1);
        targetSurface = { id: 2 };
        a.destination = target;
        assert.equal(links, 1);
        assert.equal(moves, 1);
    });
}
test('targets assigned before manager binding still retain their position', () => {
    const a = new NavAgent();
    a.destination = new Vector(4, 0, 7);
    assert.equal(a._targetPos.x, 4);
    assert.equal(a._targetPos.z, 7);
});

const { BaseNavMeshSurface } = load('common/component/BaseNavMeshSurface.ts');
test('an unknown surface type warns without constructing or registering a mesh, and can be repaired', () => {
    const surface = Object.create(BaseNavMeshSurface.prototype);
    let registrations = 0, created = 0, config = null;
    Object.assign(surface, { owner: { name: 'OldSurface' }, _agentType: 'old', enabled: true,
        _cacheDataMap: new Map(), _oriTiles: { length: 1, getNavData: () => ({ x: 0, y: 0 }) }, _buildTileList: new Set(),
        _getManager: () => ({ getNavConfig: () => config, regNavMeshSurface() { registrations++; }, removeNavMeshSurface() {} }),
        _crateNavMesh(actualConfig) { assert.equal(actualConfig, config); created++; return {
            navTileGrid: { _refeashBound() {} }, _navMeshInit() {}, _removeTile() {},
        }; },
    });
    const before = warnings.length;
    surface._onEnable();
    assert.equal(warnings.length, before + 1);
    assert.match(warnings.at(-1), /old.*OldSurface/);
    assert.equal(created, 0);
    assert.equal(registrations, 0);
    assert.equal(surface.agentType, 'old', 'preserve the missing name for diagnosis');
    assert.doesNotThrow(() => surface._update(1));
    assert.doesNotThrow(() => surface._onDisable());
    config = {};
    surface.agentType = 'valid';
    assert.equal(created, 1);
    assert.equal(registrations, 1);
    assert.equal(surface.agentType, 'valid');
});
for (const Agent of [NavAgent, Nav2DAgent]) {
    test(`${Agent.name} warns about an unknown type and can bind after the name is corrected`, () => {
        const agent = new Agent();
        agent.owner = { name: 'OldAgent' };
        agent._agentType = 'old';
        agent._getManager = () => ({ getNavConfig: () => null, getAreaFlagMap: () => new Map() });
        let binds = 0;
        agent._addAgent = () => binds++;
        const before = warnings.length;
        assert.doesNotThrow(() => agent._onEnable());
        assert.equal(binds, 0);
        assert.equal(warnings.length, before + 1);
        assert.match(warnings.at(-1), /old.*OldAgent/);
        assert.equal(agent.agentType, 'old');
        agent.agentType = 'valid';
        assert.equal(binds, 1);
    });
}


test('legacy 2D component data preserves omitted and explicitly serialized acceleration values', () => {
    for (const data of [{}, { maxAcceleration: 0 }, { maxAcceleration: 10 }, { maxAcceleration: 42 }, { maxAcceleration: 300 }]) {
        const agent = new Nav2DAgent();
        Object.assign(agent, data);
        assert.equal(agent.maxAcceleration, data.maxAcceleration ?? 10);
    }
});

test('arrival controls use normal defaults and accept explicit settings', () => {
    for (const Agent of [NavAgent, Nav2DAgent]) {
        const legacy = new Agent();
        assert.equal(legacy.autoBraking, true);
        assert.equal(legacy.stopDistance, 0);
        assert.equal(legacy.maxAcceleration, 10);
        const configured = new Agent();configured.autoBraking=true;configured.stopDistance=2.5;
        assert.equal(configured.autoBraking,true);assert.equal(configured.stopDistance,2.5);
        for (const invalid of [-1,NaN,Infinity]) {configured.stopDistance=invalid;assert.equal(configured.stopDistance,0);}
    }
});
