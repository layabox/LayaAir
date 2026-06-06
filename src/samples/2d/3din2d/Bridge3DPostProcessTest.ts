/**
 * Bridge3DSprite 2D 后处理验证测试
 *
 * 测试2D后处理效果（颜色滤镜、发光滤镜、动态色相）
 * 能否正确作用于Bridge3DSprite实例。
 *
 * 使用方法：通过方向键导航；↑↓ 重置当前测试。
 */
import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { BlurFilter } from "laya/filters/BlurFilter";
import { ColorFilter } from "laya/filters/ColorFilter";
import { GlowFilter } from "laya/filters/GlowFilter";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Event } from "laya/events/Event";
import { Main } from "../../Main";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Script } from "laya/components/Script";

class HueRotationScript extends Script {
    colorFilter: ColorFilter;
    private _hue: number = 0;
    onUpdate(): void {
        this._hue = (this._hue + 2) % 360;
        this.colorFilter.reset();
        this.colorFilter.adjustHue(this._hue - 180);
    }
}

interface TestCase {
    name: string;
    category: string;
    description: string;
    setup: () => void;
    verification: string[];
}

export class Bridge3DPostProcessTest {
    private scene2D: Scene;
    private testCases: TestCase[] = [];
    private currentTestIndex: number = 0;
    private currentContainer: Sprite = null;
    private animationCallbacks: Function[] = [];
    private infoText: Text;

    constructor(maincls: typeof Main) {
        this.scene2D = new Scene();
        maincls.box2D.addChild(this.scene2D);

        Laya.stage.bgColor = "#000000";
        this.setupGlobalLight();
        this.initializeTestCases();
        this.createUIControls();
        this.runTestCase(0);
    }

    // ── 场景 / 光照 ──────────────────────────────────────────────────────────

    private setupGlobalLight(): void {
        // Add a utility bridge to trigger scene3d creation
        const initBridge = new Bridge3DSprite();
        this.scene2D.addChild(initBridge);
        this.scene2D.bridge3DInternal.scene3d.ambientColor = new Color(0.4, 0.4, 0.4, 1);
    }

    // ── 测试注册 ──────────────────────────────────────────────────────────────

    private initializeTestCases(): void {

        // 颜色滤镜：RGB 三球变灰度
        this.testCases.push({
            name: "颜色滤镜 — 灰度",
            category: "颜色滤镜",
            description: "在含 RGB 三球的 Bridge3DSprite 上应用 ColorFilter.gray()",
            setup: () => this.testColorFilter(),
            verification: [
                "三个球体均以灰度渲染",
                "任何地方都看不到色相"
            ]
        });

        // 发光滤镜：三种颜色发光
        this.testCases.push({
            name: "发光滤镜 — 三色",
            category: "发光滤镜",
            description: "白色球体上分别施加黄 / 红 / 蓝色 GlowFilter",
            setup: () => this.testGlowFilter(),
            verification: [
                "不同颜色的光晕延伸至球体边界之外",
                "左/中/右分别为黄·红·蓝色光晕"
            ]
        });

        // 模糊滤镜：强度对比
        this.testCases.push({
            name: "模糊滤镜 — 强度对比",
            category: "模糊滤镜",
            description: "三个球体分别施加强度 0（无）/ 4 / 10 的 BlurFilter",
            setup: () => this.testBlurFilter(),
            verification: [
                "左：清晰无模糊",
                "中：轻度模糊，边缘柔化",
                "右：强模糊，轮廓扩散明显"
            ]
        });

        // 动态效果：色相持续旋转
        this.testCases.push({
            name: "动态色相旋转",
            category: "动态效果",
            description: "通过 ColorFilter 连续动画色相 0°→360°",
            setup: () => this.testDynamicHue(),
            verification: [
                "颜色循环：红→黄→绿→青→蓝→品红→红",
                "动画流畅，无闪烁"
            ]
        });

    }

    // ── 界面 ─────────────────────────────────────────────────────────────────────

    private createUIControls(): void {
        this.infoText = new Text();
        this.infoText.fontSize = 14;
        this.infoText.color = "#ffffff";
        this.infoText.pos(10, 8);
        this.infoText.size(1180, 110);
        this.infoText.wordWrap = true;
        this.scene2D.addChild(this.infoText);

        const hint = new Text();
        hint.text = "← 上一个    → 下一个    ↑↓ 重置";
        hint.fontSize = 13;
        hint.color = "#aaaaaa";
        hint.pos(10, 760);
        this.scene2D.addChild(hint);

        Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
    }

    private onKeyDown(e: any): void {
        switch (e.keyCode) {
            case 37: this.navigateTest(-1); break; // ← 左
            case 39: this.navigateTest(1); break;  // → 右
            case 38:                                // ↑ 上
            case 40: this.runTestCase(this.currentTestIndex); break; // ↓ 下
        }
    }

    private navigateTest(dir: number): void {
        let idx = this.currentTestIndex + dir;
        if (idx < 0) idx = this.testCases.length - 1;
        if (idx >= this.testCases.length) idx = 0;
        this.runTestCase(idx);
    }

    // ── 测试运行器 ────────────────────────────────────────────────────────────────

    private runTestCase(index: number): void {
        this.currentTestIndex = index;
        const tc = this.testCases[index];

        this.cleanup();

        console.log(`\n=== 测试 ${index + 1}/${this.testCases.length} ===`);
        console.log(`分类     : ${tc.category}`);
        console.log(`名称     : ${tc.name}`);
        console.log(`描述     : ${tc.description}`);
        console.log("验证     :");
        tc.verification.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));

        let info = `[${index + 1}/${this.testCases.length}] ${tc.category}  –  ${tc.name}\n`;
        info += `${tc.description}\n`;
        info += `验证: ` + tc.verification.join("  |  ");
        this.infoText.text = info;

        tc.setup();
    }

    private cleanup(): void {
        this.animationCallbacks.forEach(cb => Laya.timer.clear(this, cb as any));
        this.animationCallbacks = [];

        if (this.currentContainer) {
            this.currentContainer.destroy();
            this.currentContainer = null;
        }
    }

    // ── 辅助函数 ────────────────────────────────────────────────────────────────

    /** 为每个颜色条目创建一个包含对应球体的 Bridge3DSprite。 */
    private makeBridge(x: number, y: number, colors: Color[], spacing: number = 100): Bridge3DSprite {
        const bridge = new Bridge3DSprite();
        bridge.pos(x, y);
        bridge.pixelsPerUnit = 1;

        colors.forEach((col, i) => {
            const sphere = new MeshSprite3D(PrimitiveMesh.createSphere(40));
            const mat = new UnlitMaterial();
            mat.albedoColor = col;
            sphere.meshRenderer.material = mat;
            if (colors.length > 1) {
                sphere.transform.localPosition = new Vector3(
                    (i - (colors.length - 1) / 2) * spacing, 0, 0
                );
            }
            bridge.addChild(sphere);
        });
        return bridge;
    }

    private label(parent: Sprite, text: string, x: number, y: number): void {
        const t = new Text();
        t.text = text;
        t.fontSize = 13;
        t.color = "#eeee00";
        t.align = "center";
        t.pos(x - 80, y + 55);
        t.size(160, 20);
        parent.addChild(t);
    }

    // ── 测试实现 ───────────────────────────────────────────────────────────────

    // 颜色滤镜：灰度
    private testColorFilter(): void {
        this.currentContainer = new Sprite();
        this.scene2D.addChild(this.currentContainer);

        const bridge = this.makeBridge(600, 400, [
            new Color(1, 0.15, 0.15, 1),
            new Color(0.15, 1, 0.15, 1),
            new Color(0.15, 0.15, 1, 1)
        ]);
        this.currentContainer.addChild(bridge);
        bridge.filters = [new ColorFilter().gray()];

        this.label(this.currentContainer, "灰度 (RGB→灰)", 600, 400);
    }

    // 发光滤镜：三色
    private testGlowFilter(): void {
        this.currentContainer = new Sprite();
        this.scene2D.addChild(this.currentContainer);

        const white = new Color(1, 1, 1, 1);
        const glows = [
            { color: "#ffff00", label: "黄色发光" },
            { color: "#ff0000", label: "红色发光" },
            { color: "#0055ff", label: "蓝色发光" }
        ];
        glows.forEach((g, i) => {
            const bridge = this.makeBridge(250 + i * 300, 400, [white]);
            this.currentContainer.addChild(bridge);
            bridge.filters = [new GlowFilter(g.color, 4, 6, 6)];
            this.label(this.currentContainer, g.label, 250 + i * 300, 400);
        });
    }

    // 模糊滤镜：强度对比
    private testBlurFilter(): void {
        this.currentContainer = new Sprite();
        this.scene2D.addChild(this.currentContainer);

        const orange = new Color(1, 0.5, 0.1, 1);
        const configs = [
            { strength: 0, label: "无模糊" },
            { strength: 50, label: "模糊(50)" },
            { strength: 100, label: "模糊(100)" }
        ];
        configs.forEach((c, i) => {
            const bridge = this.makeBridge(250 + i * 300, 400, [orange]);
            this.currentContainer.addChild(bridge);
            if (c.strength > 0) bridge.filters = [new BlurFilter(c.strength)];
            this.label(this.currentContainer, c.label, 250 + i * 300, 400);
        });
    }

    // 动态色相旋转
    private testDynamicHue(): void {
        this.currentContainer = new Sprite();
        this.scene2D.addChild(this.currentContainer);

        const bridge = this.makeBridge(600, 400, [
            new Color(1, 0.15, 0.15, 1),
            new Color(0.15, 1, 0.15, 1),
            new Color(0.15, 0.15, 1, 1)
        ]);
        this.currentContainer.addChild(bridge);

        const cf = new ColorFilter();
        bridge.filters = [cf];

        const hueScript = bridge.addComponent(HueRotationScript);
        hueScript.colorFilter = cf;

        this.label(this.currentContainer, "动态色相 0→360°", 600, 400);
    }
}
