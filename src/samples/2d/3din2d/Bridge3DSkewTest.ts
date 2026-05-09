
import { Laya } from "../../../layaAir/Laya";
import { Bridge3DSprite } from "../../../layaAir/laya/bridge/Bridge3DSprite";
import { UnlitMaterial } from "../../../layaAir/laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "../../../layaAir/laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "../../../layaAir/laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "../../../layaAir/laya/display/Scene";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Text } from "../../../layaAir/laya/display/Text";
import { Color } from "../../../layaAir/laya/maths/Color";

/**
 * Bridge3D倾斜变换测试示例
 * 演示skewX和skewY在3D中的效果
 */
export class Bridge3DSkewTest {
    constructor() {
        Laya.init(1200, 800).then(() => {
            this.onLoaded();
        });
    }

    private onLoaded(): void {
        console.log("Bridge3D Skew Test - Started");

        // 创建2D场景
        const scene2D = new Scene();
        Laya.stage.addChild(scene2D);
        // Bridge3DScene3D will be auto-created when first Bridge3DSprite is added

        // 添加标题
        this.addTitle(scene2D, "Bridge3D Skew Transform Test", 20, 20);

        // 测试1: 无倾斜（对照组）
        this.createTestCase(scene2D, "No Skew", 150, 150, 0, 0, 0);

        // 测试2: 仅skewX
        this.createTestCase(scene2D, "skewX = 30°", 400, 150, 30, 0, 0);

        // 测试3: 仅skewY
        this.createTestCase(scene2D, "skewY = 30°", 650, 150, 0, 30, 0);

        // 测试4: 同时skewX和skewY
        this.createTestCase(scene2D, "skewX = 20°, skewY = 20°", 900, 150, 20, 20, 0);

        // 测试5: 倾斜 + 旋转
        this.createTestCase(scene2D, "skewX = 30° + rotation = 45°", 150, 450, 30, 0, 45);

        // 测试6: 倾斜 + 缩放
        const bridge6 = this.createTestCase(scene2D, "skewX = 30° + scale = 1.5", 400, 450, 30, 0, 0);
        bridge6.scale(1.5, 1.5);

        // 测试7: 负倾斜
        this.createTestCase(scene2D, "skewX = -30°", 650, 450, -30, 0, 0);

        // 测试8: 大角度倾斜
        this.createTestCase(scene2D, "skewX = 60°", 900, 450, 60, 0, 0);

        // 添加动画测试
        this.addAnimationTest(scene2D);

        console.log("Bridge3D Skew Test - All tests created");
    }

    /**
     * 创建一个测试用例
     */
    private createTestCase(
        scene: Scene,
        label: string,
        x: number,
        y: number,
        skewX: number,
        skewY: number,
        rotation: number
    ): Bridge3DSprite {
        // 添加标签
        this.addLabel(scene, label, x, y - 80);

        // 创建2D参考图形（红色矩形）
        const sprite2D = new Sprite();
        sprite2D.graphics.drawRect(-40, -40, 80, 80, "#ff000033");
        sprite2D.graphics.drawRect(-40, -40, 80, 80, null, "#ff0000", 2);
        sprite2D.pos(x, y);
        sprite2D.skewX = skewX;
        sprite2D.skewY = skewY;
        sprite2D.rotation = rotation;
        scene.addChild(sprite2D);

        // 创建Bridge3D（蓝色立方体）
        const bridge = new Bridge3DSprite();
        bridge.pixelsPerUnit = 1;
        bridge.pos(x, y);
        bridge.skewX = skewX;
        bridge.skewY = skewY;
        bridge.rotation = rotation;
        scene.addChild(bridge);

        // 创建3D立方体
        const cube = new MeshSprite3D(PrimitiveMesh.createBox(80, 80, 80));
        const material = new UnlitMaterial();
        material.albedoColor = new Color(0.3, 0.5, 1.0, 0.8);
        cube.meshRenderer.material = material;
        bridge.addChild(cube);

        // 添加坐标轴辅助线
        this.addAxisHelper(bridge);

        return bridge;
    }

    /**
     * 添加坐标轴辅助线
     */
    private addAxisHelper(bridge: Bridge3DSprite): void {
        // X轴（红色）
        const xAxis = new MeshSprite3D(PrimitiveMesh.createBox(100, 2, 2));
        const xMat = new UnlitMaterial();
        xMat.albedoColor = new Color(1, 0, 0, 1);
        xAxis.meshRenderer.material = xMat;
        xAxis.transform.localPositionX = 50;
        bridge.addChild(xAxis);

        // Y轴（绿色）
        const yAxis = new MeshSprite3D(PrimitiveMesh.createBox(2, 100, 2));
        const yMat = new UnlitMaterial();
        yMat.albedoColor = new Color(0, 1, 0, 1);
        yAxis.meshRenderer.material = yMat;
        yAxis.transform.localPositionY = 50;
        bridge.addChild(yAxis);
    }

    /**
     * 添加标题
     */
    private addTitle(scene: Scene, text: string, x: number, y: number): void {
        const title = new Text();
        title.text = text;
        title.fontSize = 24;
        title.color = "#ffffff";
        title.pos(x, y);
        scene.addChild(title);
    }

    /**
     * 添加标签
     */
    private addLabel(scene: Scene, text: string, x: number, y: number): void {
        const label = new Text();
        label.text = text;
        label.fontSize = 14;
        label.color = "#cccccc";
        label.pos(x - 60, y);
        scene.addChild(label);
    }

    /**
     * 添加动画测试
     */
    private addAnimationTest(scene: Scene): void {
        this.addLabel(scene, "Animated: skewX oscillating", 150, 650);

        // 创建动画测试用例
        const bridge = new Bridge3DSprite();
        bridge.pos(150, 730);
        scene.addChild(bridge);

        const cube = new MeshSprite3D(PrimitiveMesh.createBox(80, 80, 80));
        const material = new UnlitMaterial();
        material.albedoColor = new Color(1.0, 0.5, 0.3, 0.8);
        cube.meshRenderer.material = material;
        bridge.addChild(cube);

        // 添加2D参考
        const sprite2D = new Sprite();
        sprite2D.graphics.drawRect(-40, -40, 80, 80, "#ff000033");
        sprite2D.graphics.drawRect(-40, -40, 80, 80, null, "#ff0000", 2);
        sprite2D.pos(150, 730);
        scene.addChild(sprite2D);

        // 动画：skewX在-45到45度之间振荡
        let time = 0;
        Laya.timer.frameLoop(1, this, () => {
            time += 0.05;
            const skew = Math.sin(time) * 45;
            bridge.skewX = skew;
            sprite2D.skewX = skew;
        });

        console.log("Animation test added: skewX oscillating");
    }
}
