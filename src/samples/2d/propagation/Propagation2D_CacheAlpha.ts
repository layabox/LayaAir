import { Sprite } from "laya/display/Sprite";
import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

/**
 * @zh 覆盖 cacheAs/mask/嵌套 cache/cacheAs 开关切换 下的 GlobalAlpha 隔离路径(其余 propagation 用例都不触发)。
 * - cacheAs 组：改 cache 根 alpha 整组同步变淡(合成施加)，改组内单 tile alpha 只该 tile 变(相对组隔离)。
 * - 嵌套 cache：子组 composite 相对父组隔离。
 * - mask 组：验证 mask 路径 alpha(不应 ≈alpha² 重复变暗)。
 * - toggle 组：cacheAs enable/disable 间 _setAlphaBase 正确回退、不漂移。
 * - pulse 组：cacheRoot alpha 0↔1 硬切 + 内容会变，验证 alpha=0 时内容不塌、回升不拿透明旧缓存。
 * 注意：sceneHash 读 local alpha(校验动画确定性)，隔离正确性靠肉眼/不崩溃。
 */
export class Propagation2D_CacheAlpha extends Propagation2DPerfBase {
    // 用 declare(无运行时初始化器)：buildScene 由基类构造函数调用，子类字段初始化器此时还没跑；
    // 若用 = [] 既会在 buildScene 里取到 undefined，又会在 super() 后把 buildScene 填好的内容覆盖成空。
    declare private _cacheGroups: Sprite[];
    declare private _innerTiles: Sprite[];
    declare private _nestedChild: Sprite;
    declare private _maskedContent: Sprite;
    declare private _toggleGroup: Sprite;
    declare private _pulseGroup: Sprite;     // cacheRoot alpha 在 0↔1 间硬切，验证 alpha=0 时内容不塌、回升不拿透明旧缓存
    declare private _pulseInner: Sprite;     // 脉冲组内会变的内容(触发 cache 失效)

    constructor(maincls: typeof Main) {
        super(maincls, "cacheAlpha", "cacheAs/mask/nested alpha isolation", 600, 2000);
    }

    protected buildScene(nodes: number): void {
        this._cacheGroups = [];
        this._innerTiles = [];
        // 每组的 tile 数(cacheAs 会建 RT，控制规模)
        const perGroup = 16;
        const groupCount = Math.max(4, Math.min(12, Math.floor(nodes / perGroup)));

        for (let g = 0; g < groupCount; g++) {
            const group = this._makeCacheGroup(g, perGroup, 16);
            group.pos(40 + (g % 6) * 150, 80 + Math.floor(g / 6) * 200);
            group.alpha = 0.85;
            group.cacheAs = "bitmap";
            this._root.addChild(group);
            this._cacheGroups.push(group);
        }

        // 嵌套 cache：在第 0 组里再塞一个 cacheAs 子组
        if (this._cacheGroups.length > 0) {
            const nested = this._makeCacheGroup(900, 9, 12);
            nested.pos(10, 70);
            nested.alpha = 0.7;
            nested.cacheAs = "bitmap";
            this._cacheGroups[0].addChild(nested);
            this._nestedChild = nested;
        }

        // mask 组：被遮罩内容 + 一个 mask sprite(引擎会给 mask 自动 cacheAs=bitmap)
        const maskHost = new Sprite();
        maskHost.pos(40 + (groupCount % 6) * 150, 460);
        const content = this._makeCacheGroup(800, 16, 16);
        content.alpha = 0.9;
        maskHost.addChild(content);
        const maskSp = new Sprite();
        maskSp.graphics.drawCircle(60, 60, 55, "#ffffff");
        maskSp.alpha = 0.8;
        content.mask = maskSp;
        this._root.addChild(maskHost);
        this._maskedContent = content;

        // toggle 组：运行时反复开关 cacheAs，验证基准回退
        const toggle = this._makeCacheGroup(700, 16, 16);
        toggle.pos(40, 660);
        toggle.alpha = 0.95;
        this._root.addChild(toggle);
        this._toggleGroup = toggle;

        // pulse 组：cacheRoot alpha 在 0↔1 间硬切(会精确取到 0)，位置静止；内部有一个会变 alpha 的 tile
        // 触发 cache 失效。验证 cacheRoot.alpha=0 时内容仍按相对 alpha 渲进 RT(非透明)，回升到 1 后正确显示
        // (旧的 ×invert 实现会把内容塌成 0 / 跳过 cache pass，回升时可能拿到透明旧缓存)。
        const pulse = this._makeCacheGroup(600, 16, 18);
        pulse.pos(360, 660);
        pulse.cacheAs = "bitmap";
        this._root.addChild(pulse);
        this._pulseGroup = pulse;
        this._pulseInner = (pulse as any)._children[0] as Sprite;
    }

    private _makeCacheGroup(seed: number, count: number, tileSize: number): Sprite {
        const group = new Sprite();
        const cols = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
            const sp = new Sprite();
            const hue = ((seed + i) * 53) & 255;
            const color = "#" + hue.toString(16).padStart(2, "0") + "c0" + ((seed * 7) & 255).toString(16).padStart(2, "0");
            sp.graphics.drawRect(0, 0, tileSize, tileSize, color, null);
            sp.pos((i % cols) * (tileSize + 2), Math.floor(i / cols) * (tileSize + 2));
            sp.alpha = 0.6 + ((seed + i) % 5) / 12;
            group.addChild(sp);
            this._sprites.push(sp);
            this._innerTiles.push(sp);
        }
        return group;
    }

    protected runFrame(): void {
        const f = this._frame;

        // cache 根 alpha + 位置动画：整组应同步淡入淡出 / 移动
        for (let g = 0; g < this._cacheGroups.length; g++) {
            const grp = this._cacheGroups[g];
            grp.alpha = 0.4 + 0.55 * (0.5 + 0.5 * Math.sin(f * 0.04 + g));
            grp.x = (40 + (g % 6) * 150) + Math.sin(f * 0.03 + g) * 12;
        }

        // 组内单 tile alpha：相对各自 cache 根隔离，只该 tile 变
        const arr = this._innerTiles;
        for (let i = 0; i < 40 && arr.length > 0; i++) {
            const sp = arr[(i * 37 + f * 13) % arr.length];
            sp.alpha = 0.45 + ((f + i) % 24) / 40;
        }

        if (this._nestedChild) this._nestedChild.alpha = 0.4 + 0.5 * (0.5 + 0.5 * Math.cos(f * 0.05));
        if (this._maskedContent) this._maskedContent.alpha = 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(f * 0.045));

        // toggle cacheAs：覆盖 _setAlphaBase 的 enable/disable 回退路径
        if (this._toggleGroup && (f % 40) === 0) {
            this._toggleGroup.cacheAs = this._toggleGroup.cacheAs === "bitmap" ? "none" : "bitmap";
        }
        if (this._toggleGroup) this._toggleGroup.alpha = 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(f * 0.06));

        // pulse 组：cacheRoot alpha 硬切 0↔1(每 60 帧一段，精确取 0)；内部 tile alpha 每帧变 → cache 失效。
        if (this._pulseGroup) this._pulseGroup.alpha = (f % 120) < 60 ? 0 : 1;
        if (this._pulseInner) this._pulseInner.alpha = 0.3 + ((f % 30) / 30) * 0.7;
    }
}
