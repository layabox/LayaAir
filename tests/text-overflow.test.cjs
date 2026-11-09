// Run: node --test tests/text-overflow.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src/layaAir');

// Use production text layout, HTML parsing, drawing commands and clip setter.
// Isolate display initialization and supply deterministic font metrics without a GPU.
const modules = new Map();
const overrides = new Map();
function override(relative, exports) { overrides.set(path.join(root, relative + '.ts'), exports); }
function load(relative) {
    const file = path.resolve(root, relative.endsWith('.ts') ? relative : relative + '.ts');
    if (overrides.has(file)) return overrides.get(file);
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    vm.runInThisContext('(function(module,exports,require){' + code + '\n})', { filename: file })(
        module, module.exports, request => load(path.resolve(path.dirname(file), request)));
    return module.exports;
}
override('Config', { Config: { defaultFont: 'Arial', defaultFontSize: 20 } });
override('ILaya', { ILaya: { systemTimer: {
    callLater() {}, runCallLater(owner, callback) { callback.call(owner); }
} } });
override('laya/utils/ClassUtils', { ClassUtils: { regClass() {} } });
override('laya/utils/Utils', { Utils: { getFileExtension() { return ''; } } });
override('laya/utils/Browser', { Browser: { context: {
    font: '', measureText(text) { return { width: text.length * 10 }; }
} } });
override('laya/display/Render2DProcessor', { Render2DProcessor: { runner: {
    _textRender: { getFontHeight(family, size) { return size; } }
} } });
override('laya/webgl/text/TextRenderConfig', { TextRenderConfig: { fontScale: 1 } });
override('laya/display/BitmapFont', { BitmapFont: class {} });
override('laya/display/cmd/DrawRectCmd', { DrawRectCmd: class {} });

const { SpriteConst, TransformKind } = load('laya/display/SpriteConst');
const spriteFile = path.join(root, 'laya/display/Sprite.ts');
const spriteSource = ts.createSourceFile(spriteFile, fs.readFileSync(spriteFile, 'utf8'), ts.ScriptTarget.Latest, true);
const scrollRect = spriteSource.statements.find(ts.isClassDeclaration).members
    .filter(member => member.name?.getText(spriteSource) === 'scrollRect')
    .map(member => member.getText(spriteSource)).join('\n');
const context = { SpriteConst, TransformKind };
vm.runInNewContext(ts.transpileModule(`class Sprite {
    constructor() {
        this._width = this._height = this._renderType = 0;
        this._isWidthSet = this._isHeightSet = false;
        this._scrollRect = null; this.children = []; this.hideFlags = 0;
        this.clipUpdates = []; this.transformUpdates = 0;
        this._struct = { setClipRect: rect => this.clipUpdates.push(rect ? [rect.x, rect.y, rect.width, rect.height] : null) };
        this._globalTrans = { _spTransChanged: () => this.transformUpdates++ };
        this.graphics = { cmds: [], clear() { this.cmds.length = 0; }, addCmd(cmd) { this.cmds.push(cmd); } };
    }
    ${scrollRect}
    get width() { return this._width; }
    set width(value) { this._width = value; this._isWidthSet = true; this._transChanged(TransformKind.Size); }
    get height() { return this._height; }
    set height(value) { this._height = value; this._isHeightSet = true; this._transChanged(TransformKind.Size); }
    size(width, height) { this.width = width; this.height = height; return this; }
    get numChildren() { return this.children.length; }
    addChild(child) { this.children.push(child); }
    removeChildren() { this.children.length = 0; }
    _transChanged() {} repaint() {} event() {}
}
this.Sprite = Sprite;`, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
const { Sprite } = context;
override('laya/display/Sprite', { Sprite });
class HtmlImage {
    create(owner, element) {
        this.element = element;
        this.width = element.getAttrInt('width', 0);
        this.height = element.getAttrInt('height', 0);
        owner.objContainer.addChild(this);
    }
    pos(x, y) { this.x = x; this.y = y; }
    release() {}
}
override('laya/html/HtmlImage', { HtmlImage });
override('laya/html/HtmlLink', { HtmlLink: class {} });
const { Text } = load('laya/display/Text');

function fixture(overflow, width = 100, height = 100, content = 'abc') {
    const text = new Text();
    if (width != null) text.width = width;
    if (height != null) text.height = height;
    text.overflow = overflow;
    text.text = content;
    text.typeset();
    return text;
}
function assertClip(text, expected) {
    assert.equal(!!text.scrollRect, expected);
    assert.equal(!!(text._renderType & SpriteConst.CLIP), expected);
    assert.equal(!!text._objContainer?.scrollRect, expected && text._objContainer?.numChildren > 0);
}

for (const overflow of [Text.HIDDEN, Text.SCROLL]) {
    test(overflow + ': fitting, exact-fit and auto-sized text do not enable clipping', () => {
        const text = fixture(overflow);
        assertClip(text, false);
        text.size(text.textWidth, text.textHeight);
        text.typeset();
        assertClip(text, false);
        assertClip(fixture(overflow, null, null, 'abcdef\nabcdef'), false);
        assertClip(fixture(overflow, 100, null, 'abc\nabc'), false);
        assertClip(fixture(overflow, null, 100, 'abcdefghijk'), false);
    });

    test(overflow + ': horizontal and multiline vertical overflow enable clipping', () => {
        assertClip(fixture(overflow, 20), true);
        assertClip(fixture(overflow, 100, 20), false);
        assertClip(fixture(overflow, 100, 0), true);
        assertClip(fixture(overflow, 100, 40, 'abc\nabc'), true);
        assertClip(fixture(overflow, 0, 0), true);
    });

    test(overflow + ': content and size changes toggle clipping in both directions', () => {
        const text = fixture(overflow);
        text.text = 'abcdefghijk'; text.typeset();
        assertClip(text, true);
        text.text = 'abc'; text.typeset();
        assertClip(text, false);
        text.width = 20; text.typeset();
        assertClip(text, true);
        text.width = 100; text.typeset();
        assertClip(text, false);
        text.height = 20; text.typeset();
        assertClip(text, false);
        text.height = 0; text.typeset();
        assertClip(text, true);
        text.text = ''; text.typeset();
        assertClip(text, false);
    });

    test(overflow + ': padding and wrapped lines participate in overflow detection', () => {
        const text = fixture(overflow, 50, 41);
        text.padding = [10, 10, 10, 10]; text.typeset();
        assert.equal(text.textWidth, 50);
        assert.equal(text.textHeight, 41);
        assertClip(text, false);
        text.width = 49; text.typeset();
        assertClip(text, false);
        text.width = 48; text.typeset();
        assertClip(text, true);
        text.width = 50; text.wordWrap = true; text.text = 'abcdef'; text.typeset();
        assert.equal(text.lines.length, 2);
        assertClip(text, true);
        text.height = 100; text.typeset();
        assertClip(text, false);
    });

    test(overflow + ': HTML images only clip when their layout overflows', () => {
        const text = fixture(overflow);
        text.html = true;
        text.text = '<img width="20" height="20"/>'; text.typeset();
        assert.equal(text.objContainer.numChildren, 1);
        assertClip(text, false);
        text.width = 10; text.typeset();
        assertClip(text, true);
        text.width = 100; text.typeset();
        assertClip(text, false);
        text.height = 10; text.typeset();
        assertClip(text, false);
        text.height = 0; text.typeset();
        assertClip(text, true);
        text.text = ''; text.typeset();
        assertClip(text, false);
    });
}

test('scroll offsets still clamp and reset when content fits again', () => {
    const text = fixture(Text.SCROLL, 20, 25, 'abcdef\nabcdef');
    text.scrollX = 999; text.scrollY = 999;
    assert.equal(text.scrollX, text.maxScrollX);
    assert.equal(text.scrollY, text.maxScrollY);
    assertClip(text, true);
    text.size(100, 100); text.typeset();
    assert.equal(text.scrollX, 0);
    assert.equal(text.scrollY, 0);
    assertClip(text, false);
});

test('post-layout sizing and switching overflow modes update clipping', () => {
    const text = fixture(Text.HIDDEN, 20);
    text._onPostLayout = () => text.width = 100;
    text.typeset(true);
    assertClip(text, false);
    text._onPostLayout = null;
    text.width = 20; text.typeset();
    assertClip(text, true);
    text.overflow = Text.VISIBLE; text.typeset();
    assertClip(text, false);
    text.overflow = Text.HIDDEN; text.typeset();
    assertClip(text, true);
});

test('explicit clipping in visible mode survives resizing and clearing', () => {
    const text = fixture(Text.VISIBLE);
    const { Rectangle } = load('laya/maths/Rectangle');
    text.scrollRect = new Rectangle(0, 0, 10, 10);
    text.width = 200; text.typeset();
    assertClip(text, true);
    text.text = ''; text.typeset();
    assertClip(text, true);
});

for (const overflow of [Text.HIDDEN, Text.SCROLL]) {
    test(overflow + ': repeated layout and drawing do not invalidate unchanged clipping', () => {
        const text = fixture(overflow, 20);
        const rect = text.scrollRect;
        const updates = text.clipUpdates.length;
        const transforms = text.transformUpdates;
        text._oriRenderPass = { repaint: false };
        text.typeset(true); text.renderText(); text.typeset(true);
        if (overflow === Text.SCROLL) {
            text.scrollX = 1; text.scrollX = 2;
        }
        assert.equal(text.scrollRect, rect);
        assert.equal(text.clipUpdates.length, updates);
        assert.equal(text.transformUpdates, transforms);
        assert.equal(text._oriRenderPass.repaint, false);
        text.text = 'abcdef'; text.typeset();
        assert.equal(text.clipUpdates.length, updates, 'changing content inside the same clip does not update the clip');
        text.width = 25; text.typeset();
        assert.equal(text.clipUpdates.length, updates + 1, 'a changed clip size is submitted once');
        text.width = 100; text.typeset();
        assert.equal(text.clipUpdates.length, updates + 2, 'disabling clipping is submitted once');
        text.typeset(true); text.renderText();
        assert.equal(text.clipUpdates.length, updates + 2);
    });

    test(overflow + ': resizing uses the final wrapped layout for the clip update', () => {
        const text = fixture(overflow, 30, 30, 'abcdef');
        text.wordWrap = true; text.typeset();
        assertClip(text, true);
        const updates = text.clipUpdates.length;
        text.width = 60; text.typeset();
        assertClip(text, false);
        assert.equal(text.clipUpdates.length, updates + 1, 'skip the intermediate clip based on stale text height');
        text.text = 'abcdefabcdef';
        text.overflow = overflow === Text.HIDDEN ? Text.SCROLL : Text.HIDDEN;
        text.text = 'abc'; text.typeset();
        assertClip(text, false);
        assert.equal(text.clipUpdates.length, updates + 1);
    });

    test(overflow + ': HTML container does not resubmit an unchanged clip', () => {
        const text = fixture(overflow, 10);
        text.html = true;
        text.text = '<img width="20" height="20"/>'; text.typeset();
        const container = text.objContainer;
        const updates = container.clipUpdates.length;
        text.typeset(true); text.typeset(true);
        assert.equal(container.clipUpdates.length, updates);
        text.width = 15; text.typeset();
        assert.equal(container.clipUpdates.length, updates + 1);
        text.width = 100; text.typeset();
        assertClip(text, false);
        assert.equal(container.clipUpdates.length, updates + 2);
    });

    test(overflow + ': enabling clipping waits for pending content changes', () => {
        const text = fixture(Text.VISIBLE, 20, 100, 'abcdef');
        text.text = 'a';
        text.overflow = overflow;
        assert.equal(text.clipUpdates.length, 0);
        text.typeset();
        assertClip(text, false);
        assert.equal(text.clipUpdates.length, 0);
    });

    test(overflow + ': focused input clipping follows resizing while text layout is hidden', () => {
        const text = fixture(overflow, 20, 40, 'abcdef');
        const rect = text.scrollRect;
        const updates = text.clipUpdates.length;
        text.hideText(true);
        text.width = 40; text.typeset();
        assert.equal(text.scrollRect, rect);
        assert.equal(text.scrollRect.width, 40);
        assert.equal(text.clipUpdates.length, updates + 1);
        assert.equal(text.graphics.cmds.length, 0, 'resizing does not draw the hidden text');
        text.height = 60; text.typeset();
        assert.equal(text.scrollRect.height, 60);
        assert.equal(text.clipUpdates.length, updates + 2);
        text.size(40, 60); text.typeset(true);
        assert.equal(text.clipUpdates.length, updates + 2, 'unchanged dimensions do not resubmit the clip');
        text.hideText(false);
        assertClip(text, true);
        assert.equal(text.clipUpdates.length, updates + 2, 'restoring text reuses the current clip');
        assert.ok(text.graphics.cmds.length > 0);
    });

    test(overflow + ': hidden text can release clipping after growing to fit', () => {
        const text = fixture(overflow, 100, 20, 'abc\nabc');
        const updates = text.clipUpdates.length;
        text.hideText(true);
        text.height = 30; text.typeset();
        assert.equal(text.scrollRect.height, 30);
        text.height = 100; text.typeset();
        assertClip(text, false);
        assert.equal(text.clipUpdates.length, updates + 2);
        text.hideText(false);
        assertClip(text, false);
        assert.equal(text.clipUpdates.length, updates + 2);
    });

    test(overflow + ': horizontal clipping tolerates up to one pixel of overflow', () => {
        const text = fixture(overflow, 29, 100, 'abc');
        assert.equal(text.textWidth, 30);
        assertClip(text, false);
        text.width = 29.5; text.typeset();
        assertClip(text, false);
        text.width = 28.99; text.typeset();
        assertClip(text, true);
        const updates = text.clipUpdates.length;
        text.width = 29; text.typeset();
        assertClip(text, false);
        assert.equal(text.scrollX, 0);
        assert.equal(text.clipUpdates.length, updates + 1);
        text.width = 29.5; text.typeset(true);
        assert.equal(text.clipUpdates.length, updates + 1);
    });

    test(overflow + ': a single line ignores nonzero height and still draws with padding', () => {
        const text = fixture(overflow, 100, 1, 'abc');
        assert.equal(text.lines.length, 1);
        assertClip(text, false);
        assert.ok(text.graphics.cmds.length > 0);
        text.wordWrap = true;
        text.padding = [10, 0, 10, 0]; text.typeset();
        assert.equal(text.lines.length, 1);
        assertClip(text, false);
        assert.ok(text.graphics.cmds.length > 0, 'padding must not cull the single line');
        text.scrollY = 999;
        assert.equal(text.scrollY, 0);
        text.height = 0; text.typeset();
        assertClip(text, true);
        assert.equal(text.graphics.cmds.length, 0, 'zero height still hides the line');
        text.height = 1; text.typeset();
        assertClip(text, false);
        assert.ok(text.graphics.cmds.length > 0);
        text.text = 'abc\nabc'; text.typeset();
        assert.equal(text.lines.length, 2);
        assertClip(text, true);
    });

    test(overflow + ': HTML container follows the same one-pixel and single-line rules', () => {
        const text = fixture(overflow, 100, 1);
        text.html = true;
        text.text = '<img width="20" height="20"/>'; text.typeset();
        assert.equal(text.lines.length, 1);
        assert.equal(text.textWidth, 22);
        assertClip(text, false);
        text.width = 21; text.typeset();
        assertClip(text, false);
        text.width = 20.99; text.typeset();
        assertClip(text, true);
        text.width = 21; text.typeset();
        assertClip(text, false);
        text.height = 0; text.typeset();
        assertClip(text, true);
    });

    test(overflow + ': horizontal clipping preserves the full single-line height', () => {
        const text = fixture(overflow, 20, 1, 'abc');
        text.padding = [10, 0, 10, 0]; text.typeset();
        assertClip(text, true);
        const rect = text.scrollRect;
        assert.equal(rect.width, 20);
        assert.ok(rect.height >= text.padding[0] + text.lines[0].height);
        const updates = text.clipUpdates.length;
        const transforms = text.transformUpdates;
        text._oriRenderPass = { repaint: false };
        text.height = 2; text.typeset(); text.typeset(true);
        assert.equal(text.scrollRect, rect);
        assert.equal(text.clipUpdates.length, updates, 'the effective clipping rectangle did not change');
        assert.equal(text.transformUpdates, transforms);
        assert.equal(text._oriRenderPass.repaint, false);
        text.text = 'abc\nabc'; text.typeset();
        assert.equal(text.scrollRect.height, 0, 'multiline clipping still uses the text box height minus padding');
        assert.equal(text.clipUpdates.length, updates + 1);
        text.text = 'abc'; text.typeset();
        assert.ok(text.scrollRect.height >= text.padding[0] + text.lines[0].height);
        assert.equal(text.clipUpdates.length, updates + 2);
        text.height = 0; text.typeset();
        assert.equal(text.scrollRect.height, 0);
        assert.equal(text.graphics.cmds.length, 0);
        assert.equal(text.clipUpdates.length, updates + 3);
        text.height = 1; text.typeset();
        assert.ok(text.scrollRect.height >= text.padding[0] + text.lines[0].height);
        assert.equal(text.clipUpdates.length, updates + 4);
    });

    test(overflow + ': HTML clipping preserves single-line height without redundant updates', () => {
        const text = fixture(overflow, 10, 1);
        text.html = true;
        text.padding = [10, 0, 10, 0];
        text.text = '<img width="20" height="20"/>'; text.typeset();
        const container = text.objContainer;
        const rect = container.scrollRect;
        assert.ok(rect.height >= text.padding[0] + 20);
        assert.ok(text.scrollRect.height >= text.padding[0] + 20);
        const updates = [text.clipUpdates.length, container.clipUpdates.length];
        text.height = 2; text.typeset(true); text.typeset(true);
        assert.equal(container.scrollRect, rect);
        assert.equal(text.clipUpdates.length, updates[0]);
        assert.equal(container.clipUpdates.length, updates[1]);
        text.height = 0; text.typeset();
        assert.equal(text.scrollRect.height, 0);
        assert.equal(container.scrollRect.height, 0);
        assert.equal(text.clipUpdates.length, updates[0] + 1);
        assert.equal(container.clipUpdates.length, updates[1] + 1);
    });

    test(overflow + ': focused resizing retains the same effective single-line clip', () => {
        const text = fixture(overflow, 20, 1, 'abc');
        const rect = text.scrollRect;
        assert.ok(rect.height >= text.lines[0].height);
        const updates = text.clipUpdates.length;
        text.hideText(true);
        text.height = 2; text.typeset();
        assert.equal(text.scrollRect, rect);
        assert.equal(text.clipUpdates.length, updates);
        text.hideText(false);
        assert.equal(text.clipUpdates.length, updates);
        assert.ok(text.graphics.cmds.length > 0);
    });
}

test('scroll ranges use the same per-axis exemptions as clipping', () => {
    const text = fixture(Text.SCROLL, 29, 1, 'abc');
    assert.equal(text.maxScrollX, 0);
    assert.equal(text.maxScrollY, 0);
    assertClip(text, false);
    text.scrollX = 999; text.scrollY = 999;
    assert.equal(text.scrollX, 0);
    assert.equal(text.scrollY, 0);
    text.width = 20; text.typeset();
    assert.equal(text.maxScrollX, 10);
    assert.equal(text.maxScrollY, 0);
    const updates = text.clipUpdates.length;
    const transforms = text.transformUpdates;
    let renders = 0;
    const renderText = text.renderText;
    text.renderText = function () { renders++; renderText.call(this); };
    text._oriRenderPass = { repaint: false };
    text.scrollY = 999;
    text.scrollX = -1;
    assert.equal(renders, 0, 'unchanged clamped offsets do not rebuild graphics');
    text.scrollX = 999;
    assert.equal(text.scrollX, 10);
    assert.equal(renders, 1);
    text.scrollX = 10; text.scrollX = 999; text.scrollY = 1;
    assert.equal(renders, 1);
    assert.equal(text.clipUpdates.length, updates);
    assert.equal(text.transformUpdates, transforms);
    assert.equal(text._oriRenderPass.repaint, false);
    text.width = 29; text.typeset();
    assert.equal(text.maxScrollX, 0);
    assert.equal(text.maxScrollY, 0);
    assert.equal(text.scrollX, 0);
    assertClip(text, false);
    assert.equal(text.clipUpdates.length, updates + 1);
});

test('auto-sized dimensions do not advertise unavailable scrolling', () => {
    const text = fixture(Text.SCROLL, null, null, 'abcdef\nabcdef');
    assert.equal(text.maxScrollX, 0);
    assert.equal(text.maxScrollY, 0);
    assertClip(text, false);
});

test('exempted axes reset their offsets while the other axis keeps scrolling', () => {
    const text = fixture(Text.SCROLL, 20, 1, 'abc\nabc');
    text.scrollX = 999; text.scrollY = 999;
    assert.ok(text.scrollY > 0);
    const updates = text.clipUpdates.length;
    text.text = 'abc'; text.typeset();
    assert.equal(text.maxScrollY, 0);
    assert.equal(text.scrollY, 0);
    assert.equal(text.scrollX, 10);
    assert.ok(text.scrollRect.height >= text.lines[0].height);
    assert.equal(text.clipUpdates.length, updates + 1);
    text.text = 'abc\nabc'; text.typeset();
    text.scrollY = 999;
    const scrollY = text.scrollY;
    const verticalUpdates = text.clipUpdates.length;
    text.width = 29; text.typeset();
    assert.equal(text.maxScrollX, 0);
    assert.equal(text.scrollX, 0);
    assert.equal(text.scrollY, scrollY);
    assertClip(text, true);
    assert.equal(text.clipUpdates.length, verticalUpdates + 1);
    text.typeset(true); text.scrollX = 999;
    assert.equal(text.clipUpdates.length, verticalUpdates + 1);
});

// Exercise the production scrollbar consumer with the real Text implementation.
const areaFile = path.join(root, 'laya/ui/TextArea.ts');
const areaSource = ts.createSourceFile(areaFile, fs.readFileSync(areaFile, 'utf8'), ts.ScriptTarget.Latest, true);
const areaMembers = areaSource.statements.find(ts.isClassDeclaration).members
    .filter(member => ['changeScroll', 'onHBarChanged', 'onVBarChanged', 'maxScrollX', 'maxScrollY', 'scrollX', 'scrollY']
        .includes(member.name?.getText(areaSource)))
    .map(member => member.getText(areaSource)).join('\n');
const areaContext = {};
vm.runInNewContext(ts.transpileModule(`class TextArea { ${areaMembers} } this.TextArea = TextArea;`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 }
}).outputText, areaContext);
function areaFixture(width, height, content, wordWrap = true) {
    const text = fixture(Text.SCROLL, width, height, content);
    text.wordWrap = wordWrap; text.typeset();
    const area = new areaContext.TextArea();
    const bar = () => ({ width: 8, height: 8, setScroll(min, max, value) { this.min = min; this.max = max; this.value = value; } });
    Object.assign(area, { _tf: text, _width: width, _height: height, _vScrollBar: bar(), _hScrollBar: bar() });
    return area;
}

test('TextArea hides scrollbars for tolerated width and single-line height', () => {
    for (const area of [areaFixture(29, 1, 'abc', false), areaFixture(100, 1, 'abc')]) {
        const updates = area._tf.clipUpdates.length;
        area.changeScroll(); area.changeScroll();
        assert.equal(area._hScrollBar.visible, false);
        assert.equal(area._vScrollBar.visible, false);
        assert.equal(area.maxScrollX, 0);
        assert.equal(area.maxScrollY, 0);
        assert.equal(area._tf.clipUpdates.length, updates);
    }
});

test('TextArea horizontal scrolling works and repeated refreshes keep the clip unchanged', () => {
    const area = areaFixture(20, 100, 'abc');
    area._tf.wordWrap = false;
    area.changeScroll();
    assert.equal(area._hScrollBar.visible, true);
    assert.equal(area._vScrollBar.visible, false);
    assert.equal(area._hScrollBar.max, 10);
    const updates = area._tf.clipUpdates.length;
    area._hScrollBar.value = 10;
    area.onHBarChanged();
    assert.equal(area.scrollX, 10);
    area.changeScroll(); area.changeScroll();
    assert.equal(area._tf.clipUpdates.length, updates);
    area._tf.text = 'ab'; area.changeScroll();
    assert.equal(area._hScrollBar.visible, false);
    assert.equal(area.scrollX, 0);
    assertClip(area._tf, false);
    const clearedUpdates = area._tf.clipUpdates.length;
    area.changeScroll();
    assert.equal(area._tf.clipUpdates.length, clearedUpdates);
});

test('TextArea multiline vertical scrolling still works without redundant clip updates', () => {
    const area = areaFixture(100, 20, 'abc\nabc');
    area.changeScroll();
    assert.equal(area._vScrollBar.visible, true);
    assert.equal(area._hScrollBar.visible, false);
    assert.ok(area._vScrollBar.max > 0);
    const updates = area._tf.clipUpdates.length;
    area._vScrollBar.value = area._vScrollBar.max;
    area.onVBarChanged();
    assert.equal(area.scrollY, area.maxScrollY);
    area.changeScroll(); area.changeScroll();
    assert.equal(area._tf.clipUpdates.length, updates);
});
