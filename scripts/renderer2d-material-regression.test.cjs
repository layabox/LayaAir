const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = path.resolve(__dirname, '../src/layaAir/laya/NodeRender2D/BaseRenderNode2D.ts');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText, { exports: exportsObject, require: name => name === '../components/Component' ? { Component: class {} } : {} });
const { BaseRenderNode2D } = exportsObject;
function material(name) {
    return { name, valid: true, references: 0, owners: new Set(), _shaderValues: name,
        _shader: { getSubShaderAt: () => name },
        _setOwner2DElement(element) { this.owners.add(element); },
        _removeOwnerElement(element) { this.owners.delete(element); },
        _addReference() { this.references++; }, _removeReference() { this.references--; } };
}
function fixture() {
    const fallback = material('default'), element = {};
    const renderer = Object.assign(Object.create(BaseRenderNode2D.prototype), {
        _materials: [], _renderElements: [element],
        _getElementMaterial() { return this._materials[0] || fallback; },
        _isMaterialVaild(value) { return value.valid; },
    });
    return { renderer, fallback, element };
}
test('serialized null material binds the renderer default and permits remaining properties to restore', () => {
    const { renderer, fallback, element } = fixture();
    Object.assign(renderer, { sharedMaterial: null, restoredWidth: 28 });
    assert.equal(renderer.sharedMaterial, null);
    assert.equal(renderer.restoredWidth, 28);
    assert.equal(element.subShader, 'default');
    assert.equal(element.materialShaderData, 'default');
    assert.ok(fallback.owners.has(element));
});
test('custom material removal restores default ownership and balances custom references', () => {
    const { renderer, fallback, element } = fixture(), custom = material('custom');
    renderer.sharedMaterial = null;
    for (let i = 0; i < 3; i++) {
        renderer.sharedMaterial = custom;
        assert.equal(element.subShader, 'custom');
        assert.equal(custom.references, 1);
        assert.equal(fallback.owners.size, 0);
        renderer.sharedMaterial = null;
        assert.equal(element.subShader, 'default');
        assert.equal(custom.references, 0);
        assert.equal(custom.owners.size, 0);
        assert.equal(fallback.owners.size, 1);
    }
    renderer.sharedMaterial = null;
    assert.equal(custom.references, 0);
});
test('invalid materials leave the existing binding unchanged', () => {
    const { renderer, element } = fixture(), custom = material('custom'), invalid = material('invalid');
    renderer.sharedMaterial = custom;
    invalid.valid = false;
    renderer.sharedMaterial = invalid;
    assert.equal(renderer.sharedMaterial, custom);
    assert.equal(element.subShader, 'custom');
    assert.equal(custom.references, 1);
    assert.equal(invalid.references, 0);
});
