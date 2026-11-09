const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies) {
    const source = fs.readFileSync(path.join(__dirname, '../src/layaAir/laya', file), 'utf8');
    const code = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS }
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require(name) {
        assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
        return dependencies[name];
    }});
    return exports;
}

// No document, window, MouseEvent or TouchEvent globals: all cursor writes must use PAL.
const cursors = [];
const PAL = { browser: { setCursor(value) { cursors.push(value); } } };
const { Mouse } = load('utils/Mouse.ts', { '../platform/PlatformAdapters': { PAL } });
const Event = { CLICK: 'click', LINK: 'link', MOUSE_OVER: 'mouseover', MOUSE_OUT: 'mouseout', UNDISPLAY: 'undisplay' };
class Sprite {
    handlers = new Map();
    on(type, caller, listener) {
        this.handlers.set(type, listener ? listener.bind(caller) : caller);
    }
    event(type, data) { this.handlers.get(type)?.(data); }
    removeSelf() { this.event(Event.UNDISPLAY); }
    destroy() { this.removeSelf(); }
}
class Rectangle {
    setTo(x, y, width, height) { Object.assign(this, { x, y, width, height }); }
    contains(x, y) { return x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height; }
}
const { HtmlLink } = load('html/HtmlLink.ts', {
    '../display/Sprite': { Sprite }, '../events/Event': { Event },
    '../maths/Rectangle': { Rectangle }, '../utils/Mouse': { Mouse }
});
const links = [];
const owner = { objContainer: { addChild() {} }, bubbleEvent(...args) { links.push(args); } };
const element = { getAttrString() { return 'test-link'; } };
function link() { const value = new HtmlLink(); value.create(owner, element); return value; }
const mouse = { nativeEvent: { type: 'mousemove' } };
const touch = { nativeEvent: { changedTouches: [{ identifier: 0 }] } };
const first = link(), second = link();
function over(value, event = mouse) { value._shape.event(Event.MOUSE_OVER, event); }
function out(value, event = mouse) { value._shape.event(Event.MOUSE_OUT, event); }

Mouse.cursor = 'crosshair';
over(first);
assert.equal(cursors.at(-1), 'pointer');
over(first); // Repeated entry must not overwrite the saved cursor.
out(first);
assert.equal(Mouse.cursor, 'crosshair');
over(first);
out(first);
over(second);
assert.equal(Mouse.cursor, 'pointer');
second.release();
assert.equal(Mouse.cursor, 'crosshair');
second.create(owner, element); // Pooled links can be reused.
over(second);
second._shape.event(Event.UNDISPLAY);
assert.equal(Mouse.cursor, 'crosshair');
over(first);
first.destroy();
assert.equal(Mouse.cursor, 'crosshair');

const third = link();
const count = cursors.length;
over(third, touch);
out(third, touch);
assert.equal(cursors.length, count);
over(third);
out(third, touch); // A touch must not clear an existing mouse hover.
assert.equal(Mouse.cursor, 'pointer');
out(third);
assert.equal(Mouse.cursor, 'crosshair');
over(third);
Mouse.cursor = 'wait';
out(third);
assert.equal(Mouse.cursor, 'wait');

Mouse.hide();
over(third);
assert.equal(cursors.at(-1), 'none');
Mouse.show();
assert.equal(cursors.at(-1), 'pointer');
Mouse.hide();
third.release();
assert.equal(cursors.at(-1), 'none');
Mouse.show();
assert.equal(cursors.at(-1), 'wait');

third.create(owner, element);
third.addRect(0, 0, 20, 10);
third.addRect(0, 10, 40, 10);
assert.equal(third.contains(30, 15), true);
assert.equal(third.contains(30, 5), false);
third._shape.event(Event.CLICK);
assert.deepEqual(links, [[Event.LINK, 'test-link']]);
third.resetArea();
assert.equal(third.contains(5, 5), false);

// Platforms without a cursor API safely ignore the adapter call.
PAL.browser.setCursor = () => {};
over(third);
third.release();
assert.equal(Mouse.cursor, 'wait');
console.log('HtmlLink cursor: hover, lifecycle, pooling, touch, hidden/custom cursors and link hit/click passed');
