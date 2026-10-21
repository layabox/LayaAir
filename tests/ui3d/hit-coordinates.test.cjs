// Run: node --test tests/ui3d/hit-coordinates.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the engine methods without initializing a GPU renderer.
function method(file, name) {
    const source = fs.readFileSync(path.resolve(__dirname, '../../src/layaAir/laya', file), 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    let result;
    function visit(node) {
        if (ts.isMethodDeclaration(node) && node.name.getText(ast) === name)
            result = node.getText(ast);
        ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.ok(result, `${file}: ${name}`);
    return result;
}
const input = { inst: { getSpriteUnderPoint(sprite, x, y) {
    input.lastPoint = { x, y };
    return x >= 0 && x < 100 && y >= 0 && y < 100 ? sprite : null;
} } };
const context = { InputManager: input, LayaEnv: { isPlaying: true }, tempMatrix: {} };
const code = `
class Point {
    static TEMP = new Point();
    setTo(x, y) { this.x=x; this.y=y; return this; }
}
class Matrix { ${method('maths/Matrix.ts', 'invertTransformPoint')} }
class Sprite { ${method('display/Sprite.ts', 'fromParentPoint')} }
// The 3D panel transform is identity; the actual 2D root conversion runs below.
class Vector3 {
    static transformCoordinate(value, matrix, out) { Object.assign(out, value); }
    static TransformNormal(value, matrix, out) { Object.assign(out, value); }
}
class UI3D {
    static _ray = { origin: {}, direction: { normalize() {} } };
    ${method('d3/core/UI3D/UI3D.ts', '_parseHit')}
}
this.classes = { Sprite, Matrix, UI3D };
`;
vm.runInNewContext(ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 }
}).outputText, context);
const { Sprite, Matrix, UI3D } = context.classes;

function check(options, shellPoint, offset, expected) {
    const sprite = Object.assign(new Sprite(), {
        _x: 0, _y: 0, pivotX: 0, pivotY: 0,
        _scaleX: 1, _scaleY: 1, _scrollRect: null, transform: null
    }, options);
    const ui = Object.assign(new UI3D(), {
        _uisprite: sprite,
        _matrix: { invert() {} },
        _shellSprite: {
            displayRT: { width: 256, height: 256 }, rtWidth: 256, rtHeight: 256,
            _contentOffsetX: offset[0], _contentOffsetY: offset[1]
        }
    });
    const textureX = shellPoint[0] - offset[0];
    const textureY = shellPoint[1] - offset[1];
    const hit = ui._parseHit({
        origin: { x: textureX / 256 - 0.5, y: 0.5 - textureY / 256, z: 1 },
        direction: { x: 0, y: 0, z: -1 }
    });
    assert.equal(hit, expected[0] >= 0 && expected[0] < 100 && expected[1] >= 0 && expected[1] < 100 ? sprite : null);
    assert.ok(Math.abs(input.lastPoint.x - expected[0]) < 1e-8, `local x: ${input.lastPoint.x}`);
    assert.ok(Math.abs(input.lastPoint.y - expected[1]) < 1e-8, `local y: ${input.lastPoint.y}`);
}
function matrix(a, b, c, d) {
    return Object.assign(new Matrix(), { a, b, c, d, tx: 0, ty: 0 });
}
test('translated root retains the existing hit position', () => {
    check({ _x: 30, _y: 40 }, [55, 65], [30, 40], [25, 25]);
});
test('pivoted root accepts the newly visible left half', () => {
    check({ pivotX: 50, pivotY: 50 }, [-25, -25], [-50, -50], [25, 25]);
});
test('nonuniform scale converts pixels to local coordinates', () => {
    check({ transform: matrix(2, 0, 0, 3), _scaleX: 2, _scaleY: 3 }, [150, 150], [0, 0], [75, 50]);
});
test('rotation, translation and pivot are all inverted', () => {
    check({ _x: 100, _y: 30, pivotX: 50, pivotY: 50, transform: matrix(0, 1, -1, 0) },
        [75, 5], [50, -20], [25, 75]);
});
test('negative scale retains mirrored hit positions', () => {
    check({ transform: matrix(-2, 0, 0, 1), _scaleX: -2 }, [-150, 25], [-200, 0], [75, 25]);
});
test('scroll offset is restored before root hit testing', () => {
    check({ _scrollRect: { x: 20, y: 10 } }, [5, 15], [0, 0], [25, 25]);
});
test('points outside the local root remain outside', () => {
    check({ pivotX: 50 }, [-60, 25], [-50, 0], [-10, 25]);
});
