const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Run after npm run build. Use the real classes and replace only platform/GPU setup.
const libs = process.env.LAYA_TEST_LIBS || path.resolve(__dirname, '../build/libs');
const context = { console, performance, setTimeout, clearTimeout, document: {} };
context.window = context;
for (const module of ['core', 'webgl_2D', 'light2D', 'tilemap']) {
    const file = path.join(libs, `laya.${module}.js`);
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
const L = context.Laya;

test('Event.EMPTY sets the event type and target without sending the sentinel', () => {
    const bus = new L.EventDispatcher();
    let event;
    bus.on('change', ev => { event = [ev, ev.type, ev.target]; });
    bus.event('change', L.Event.EMPTY);
    assert.notEqual(event[0], L.Event.EMPTY);
    assert.deepEqual(event.slice(1), ['change', bus]);

    const values = [];
    bus.on('data', (...args) => values.push(args));
    for (const value of [0, false, null, [1, 2], undefined]) bus.event('data', value);
    assert.deepEqual(values, [[0], [false], [null], [1, 2], []]);
});

test('local package reports a missing manifest or rejected entry and still reports success', async () => {
    const original = L.Loader.downloader;
    try {
        L.Loader.downloader = { package: (_path, _progress, done) => done({}, null) };
        const loader = Object.create(L.Loader.prototype);
        loader._loadFileConfig = () => Promise.resolve(false);
        assert.equal(await loader.loadPackage('local'), false);
        loader._loadFileConfig = () => Promise.reject(new Error('entry failed'));
        assert.equal(await loader.loadPackage('local'), false);
        loader._loadFileConfig = () => Promise.resolve(true);
        assert.equal(await loader.loadPackage('local'), true);
    } finally {
        L.Loader.downloader = original;
    }
});

test('disabling a nested 2D postprocess restores the inherited pass for descendants', () => {
    const outer = new L.WebRenderStruct2D();
    const sprite = new L.WebRenderStruct2D();
    const child = new L.WebRenderStruct2D();
    const inherited = { priority: 1, repaint: false };
    const postprocess = { enable: false, priority: 0, repaint: false };
    outer.pass = inherited;
    outer.addChild(sprite, 0);
    sprite.addChild(child, 0);

    const node = Object.assign(Object.create(L.Sprite.prototype), {
        _struct: sprite, _subStruct: new L.WebRenderStruct2D(), _oriRenderPass: postprocess,
        _refreshRenderPass() {},
    });
    node.setSubRenderPassState(true);
    assert.equal(child.pass, postprocess);
    node.setSubRenderPassState(false);
    assert.equal(child.pass, inherited);
    assert.equal(inherited.repaint, true);
});

test('disabled FreeformLight2D stays unregistered while editing its polygon', () => {
    const activeLights = new Set();
    const manager = { addLight: light => activeLights.add(light), removeLight: light => activeLights.delete(light),
        needCollectLightInLayer() {} };
    const owner = { activeInHierarchy: true, scene: { _light2DManager: manager } };
    const light = Object.assign(Object.create(L.FreeformLight2D.prototype), { owner, _clearScreenCache() {} });
    const polygon = new L.PolygonPoint2D();
    polygon.addPoint(0, 0);
    polygon.addPoint(10, 0);
    polygon.addPoint(10, 10);

    light._enabled = false;
    light.polygonPoint = polygon;
    assert.equal(activeLights.size, 0);
    light._enabled = true;
    owner.activeInHierarchy = false;
    light.polygonPoint = polygon;
    assert.equal(activeLights.size, 0);
    owner.activeInHierarchy = true;
    light.polygonPoint = polygon;
    assert.ok(activeLights.has(light));
    light.polygonPoint = null;
    assert.equal(activeLights.size, 0);
});

test('TileMap replaces the old tile reference and removes all cells across chunks', () => {
    function chunk() {
        const c = new L.TileMapChunkData();
        c._tileLayer = { _chunk: { _getCellPosByChunkPosAndIndex: (_x, _y, index, out) => out.setValue(index, 0) } };
        return c;
    }
    const makeTile = gid => Object.assign(new L.TileSetCellData(), { gid, _cellowner: { owner: { id: 1 } } });
    const first = chunk(), second = chunk();
    const old = makeTile(1), replacement = makeTile(2), survivor = makeTile(3);

    first._setCell(0, old, 0);
    first._setCell(1, survivor, 0);
    first._setCell(0, replacement, 0);
    assert.deepEqual(Array.from(first._refGids), [3, 2]);
    first._setCell(2, replacement, 0);
    second._setCell(0, replacement, 0);
    second._setCell(1, replacement, 0);

    replacement.destroy();
    assert.deepEqual(Array.from(first._refGids), [3]);
    assert.deepEqual(Object.keys(first._cellDataMap), ['1']);
    assert.deepEqual(Object.keys(second._cellDataMap), []);
    assert.deepEqual(Array.from(second._refGids), []);
    second._tileSize.setValue(32, 32);
    const range = second.getRange();
    assert.deepEqual([range.width, range.height], [0, 0]);
});

const Camera = L.Camera2D;
L.ILaya.timer = { delta: 1000 / 60 };

// Replace only GPU-backed construction; use the real transform and matrix code.
function fixture() {
    const pos = { x: 480, y: 320, rotation: 0 };
    const c = Object.assign(Object.create(Camera.prototype), {
        _cameraPos: new L.Vector2(480, 320), _cameraSmoothPos: new L.Vector2(480, 320),
        _firstUpdate: false, _zoom: new L.Vector2(1, 1),
        _cameraMatrix: new L.Matrix3x3(), _cameraInvertMatrix: new L.Matrix3x3(), _rect: new L.Vector4(),
        _ignoreRotation: false, _cameraRotation: 0,
        _limit_Left: 0, _limit_Right: 1920, _limit_Top: 0, _limit_Bottom: 1280,
        _positionSpeed: .15,
    });
    Object.defineProperty(c, 'globalTrans', { value: {
        getPos(p) { p.x = pos.x; p.y = pos.y; },
        get rotation() { return pos.rotation; },
    } });
    c._getScreenSize = () => ({ x: 960, y: 640 });
    return { c, pos, step(dt = 1000 / 60) {
        L.ILaya.timer.delta = dt;
        c._getCameraTransform();
        return c.cameraMatrix.elements;
    } };
}
function near(a, b, epsilon = 1e-3) {
    assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);
}

test('same elapsed time gives the same smoothing response at 30, 60 and 120 Hz', () => {
    for (const speed of [0, .15, 1]) {
        const positions = [];
        for (const fps of [30, 60, 120]) {
            const { c, pos, step } = fixture();
            c.positionSmooth = true;
            c.positionSpeed = speed;
            Object.assign(pos, { x: 780, y: 520 });
            for (let i = 0; i < fps; i++) step(1000 / fps);
            positions.push(c._cameraSmoothPos.clone());
        }
        for (const p of positions) {
            near(p.x, positions[0].x);
            near(p.y, positions[0].y);
        }
    }
});

test('an irregular sequence of frame times matches steady 60 Hz', () => {
    const run = times => {
        const { c, pos, step } = fixture();
        c.positionSmooth = true;
        Object.assign(pos, { x: 780, y: 520 });
        for (const dt of times) step(dt);
        return c._cameraSmoothPos;
    };
    const regular = run(Array(60).fill(1000 / 60));
    const irregular = run([10, 90, 5, 195, 200, 500]);
    near(regular.x, irregular.x);
    near(regular.y, irregular.y);
});

test('zero elapsed time does not advance smoothing', () => {
    const { c, pos, step } = fixture();
    c.positionSmooth = true;
    pos.x = 780;
    near(step(0)[6], 480);
});

test('long frames and large smoothing speeds converge without overshooting', () => {
    for (const speed of [.15, 1, 10]) {
        const { c, pos, step } = fixture();
        c.positionSmooth = true;
        c.positionSpeed = speed;
        pos.x = 780;
        const m = step(5000);
        assert.ok(m[6] > 480 && m[6] <= 780);
    }
});

test('60 Hz smoothing and drag margins retain their existing response', () => {
    const { c, pos, step } = fixture();
    c.positionSmooth = true;
    pos.x = 780;
    near(step()[6], 487.2);
    c.positionSmooth = false;
    c.dragHorizontalEnable = c.dragVerticalEnable = true;
    c.drag_Left = c.drag_Right = c.drag_Top = c.drag_Bottom = .2;
    c._cameraPos.setValue(480, 320);
    Object.assign(pos, { x: 780, y: 520 });
    const m = step();
    near(m[6], 684);
    near(m[7], 456);
});
