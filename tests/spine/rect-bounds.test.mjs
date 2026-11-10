// 对比 Spine 滤镜包围盒修改前后。
// 渲染偏移保持历史公式；期望包围盒由着色器映射独立算出，不从 rect 公式反推。
import assert from "node:assert/strict";
import fs from "node:fs";

const renderNodeSource = fs.readFileSync(new URL("../../src/layaAir/laya/spine/Spine2DRenderNode.ts", import.meta.url), "utf8");
const templetSource = fs.readFileSync(new URL("../../src/layaAir/laya/spine/SpineTemplet.ts", import.meta.url), "utf8");
assert.match(renderNodeSource, /this\._renderOffset\.x \+ this\._templet\.offsetX - this\._templet\.width/);
assert.match(renderNodeSource, /this\._renderOffset\.y \+ this\._templet\.offsetY/);
assert.match(templetSource, /this\.offsetX = bounds\.x \+ bounds\.width/);
assert.match(templetSource, /this\.offsetX = \(this\.skeletonData\.x \|\| 0\) \+ this\.width/);
assert.doesNotMatch(templetSource, /this\.offsetX = -bounds\.x/);
assert.doesNotMatch(templetSource, /this\.offsetX = -\(this\.skeletonData\.x/);

function historicalOffset(bounds) {
    return {
        offsetX: bounds.x + bounds.width,
        offsetY: -(bounds.y + bounds.height)
    };
}

function renderOffset(user, offset) {
    return {
        x: user.x + offset.offsetX,
        y: user.y - offset.offsetY
    };
}

function shaderLocal(spineX, spineY, offset) {
    return {
        x: spineX + offset.x,
        y: -spineY + offset.y
    };
}

function visualBounds(bounds, offset) {
    const corners = [
        shaderLocal(bounds.x, bounds.y, offset),
        shaderLocal(bounds.x + bounds.width, bounds.y, offset),
        shaderLocal(bounds.x, bounds.y + bounds.height, offset),
        shaderLocal(bounds.x + bounds.width, bounds.y + bounds.height, offset)
    ];
    const xs = corners.map(point => point.x);
    const ys = corners.map(point => point.y);
    return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        z: Math.max(...xs),
        w: Math.max(...ys)
    };
}

function oldRect(offset, width, height) {
    return {
        x: offset.x,
        y: offset.y,
        z: offset.x + width,
        w: offset.y + height
    };
}

function newRect(offset, templet, width, height) {
    const x = offset.x + templet.offsetX - width;
    const y = offset.y + templet.offsetY;
    return { x, y, z: x + width, w: y + height };
}

function rejectedRenderOffset(user, bounds) {
    return renderOffset(user, {
        offsetX: -bounds.x,
        offsetY: -(bounds.y + bounds.height)
    });
}

function same(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
}

const cases = [
    { name: "非居中骨骼", bounds: { x: 10, y: -30, width: 80, height: 120 }, user: { x: 0, y: 0 } },
    { name: "非居中骨骼 + 用户偏移", bounds: { x: 10, y: -30, width: 80, height: 120 }, user: { x: 5, y: -8 } },
    { name: "X 居中骨骼", bounds: { x: -40, y: -20, width: 80, height: 40 }, user: { x: 0, y: 0 } },
    { name: "左边缘对齐但顶部不在 0", bounds: { x: 0, y: 10, width: 90, height: 40 }, user: { x: 0, y: 0 } }
];

console.log("name | renderOffset | visual | oldRect | newRect | rejectedRenderOffset");
for (const item of cases) {
    const offset = historicalOffset(item.bounds);
    const historical = renderOffset(item.user, offset);
    const visual = visualBounds(item.bounds, historical);
    const before = oldRect(historical, item.bounds.width, item.bounds.height);
    const after = newRect(historical, offset, item.bounds.width, item.bounds.height);
    const rejected = rejectedRenderOffset(item.user, item.bounds);

    assert.deepEqual(after, visual, `${item.name}: 新包围盒应等于着色器映射后的骨骼范围`);
    assert.equal(after.z - after.x, item.bounds.width);
    assert.equal(after.w - after.y, item.bounds.height);
    assert.notDeepEqual(before, visual, `${item.name}: 旧包围盒不能覆盖实际绘制范围`);
    const centeredOnX = item.bounds.x * 2 + item.bounds.width === 0;
    if (centeredOnX) {
        assert.deepEqual(rejected, historical, `${item.name}: X 居中时两种 offsetX 数值相同`);
    } else {
        assert.notDeepEqual(rejected, historical, `${item.name}: 改 offsetX 会移动渲染位置`);
        const moved = shaderLocal(item.bounds.x, item.bounds.y + item.bounds.height, rejected);
        assert.notEqual(moved.x, visual.x, `${item.name}: 被拒绝的 offsetX 会改变左边缘`);
    }
    assert.ok(!same(before, after));

    console.log([
        item.name,
        `(${historical.x}, ${historical.y})`,
        `(${visual.x}, ${visual.y}, ${visual.z}, ${visual.w})`,
        `(${before.x}, ${before.y}, ${before.z}, ${before.w})`,
        `(${after.x}, ${after.y}, ${after.z}, ${after.w})`,
        `(${rejected.x}, ${rejected.y})`
    ].join(" | "));
}

console.log("pass: 渲染偏移与修改前一致，包围盒对齐骨骼范围");
