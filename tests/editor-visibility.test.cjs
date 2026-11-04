const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(editing = true) {
    const runtime = { console, performance, setTimeout, clearTimeout, document: {} };
    runtime.window = runtime;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../build/libs/laya.core.js'), 'utf8'), runtime);
    const L = runtime.Laya;
    L.LayaEnv.isPlaying = !editing;
    function node(name, parent = null) {
        // Keep the real engine visibility setters and propagation; replace only GPU-backed work.
        const sp = Object.assign(Object.create(L.Sprite.prototype), {
            name, _parent: parent, _$parent: parent, _children: [], _bits: 0, _reactiveBits: 0,
            _visible: true,
            _struct: { enabled: true, setRepaint() {} }, _extra: {}, _destroyed: false,
            repaint() {}, parentRepaint() {}, _checkSubRenderPass() {}, _refreshRenderPass() {}
        });
        sp._$children = sp._children;
        parent?._children.push(sp);
        sp._processVisible();
        return sp;
    }
    return { L, node };
}

function setForceVisible(node, value) {
    node._extra.forceVisible = value;
    node._processVisible();
}

test('the engine has no forceVisible property and playing ignores the editor metadata', () => {
    const { node } = fixture(false);
    const root = node('root'), child = node('child', root);
    root.visible = false;
    assert.equal('forceVisible' in root, false);
    setForceVisible(root, true);
    assert.equal(root._struct.enabled, false);
    assert.equal(child._struct.enabled, false);
});

test('editor metadata shows descendants whose own Visible is true', () => {
    const { node } = fixture();
    const root = node('root'), child = node('child', root), hidden = node('hidden', root);
    const grandchild = node('grandchild', child);
    root.visible = hidden.visible = false;
    setForceVisible(root, true);
    for (const sp of [root, child, grandchild]) assert.equal(sp._struct.enabled, true);
    assert.equal(root.visible, false);
    assert.equal(hidden._struct.enabled, false);
    setForceVisible(root, false);
    assert.equal(child._struct.enabled, false);
});
