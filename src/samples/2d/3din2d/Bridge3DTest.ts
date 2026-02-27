import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Bridge3DCoordinate } from "laya/bridge/utils/Bridge3DCoordinate";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { Main } from "../../Main";
import { Script } from "laya/components/Script";

class BridgeRotationScript extends Script {
    private _angle: number = 0;
    onUpdate(): void {
        this._angle += 10;
        (this.owner as Sprite).rotation = this._angle;
    }
}

/**
 * Bridge3D测试示例
 * 演示基础的2D/3D混合渲染功能
 */
export class Bridge3DTest {
    constructor(maincls: typeof Main) {
        this.onLoaded(maincls);
    }

    private onLoaded(maincls: typeof Main): void {
        console.log("Bridge3D Test - Started");

        // Output coordinate system debug info
        // Bridge3DCoordinate.debugInfo();

        // Create 2D scene (Scene now has built-in Bridge3DScene3D support via auto-initialization)
        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        let x = 500;
        let y = 500;
        // Create Bridge3DSprite (auto-creates Bridge3DScene3D on first add)
        const bridge = new Bridge3DSprite();
        bridge.pos(x, y);
        bridge.scale3DToPixel = 1;
        scene2D.addChild(bridge);

        // Access scene3D through Bridge3DSprite getter (triggers lazy initialization)
        let scene3d = scene2D.bridge3D;

        let sprite = new Sprite;
        sprite.graphics.drawCircle(0, 0, 30, "#ff0000");
        scene2D.addChild(sprite);
        sprite.pos(x, y);

        console.log("Bridge3D created at (400, 300)");
        console.log("2D Logic Position: (400, 300)");

        scene3d.ambientColor = new Color(1, 1, 1, 1);
        let lightSprite = new Bridge3DSprite;
        scene2D.addChild(lightSprite);

        let directionLight = new Sprite3D;
        let dircom = directionLight.addComponent(DirectionLightCom);
        lightSprite.addChild(directionLight);

        dircom.color = new Color(1, 0, 0, 1);
        //设置平行光的方向
        var mat: Matrix4x4 = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        directionLight.transform.worldMatrix = mat;

        // 输出转换后的3D世界坐标
        // 创建3D立方体
        const cube = new MeshSprite3D(PrimitiveMesh.createSphere(50));

        // 创建材质
        // const material = new UnlitMaterial();
        const material = new BlinnPhongMaterial();
        material.albedoColor = new Color(0.8, 0.3, 0.3, 1.0);
        cube.meshRenderer.material = material;
        cube.transform.localPosition = new Vector3(0, 100, 0);

        // 添加到Bridge3D
        bridge.addChild(cube);

        console.log("3D cube added to Bridge3D");
        console.log(`Number of 3D children: ${bridge.numChildren}`);

        // 测试多个3D子节点
        // this.testMultiple3DChildren(bridge);

        // 测试动画
        // this.testAnimation(bridge);

        console.log("Bridge3D Test - All tests initiated");

        // Run diagnostic tests
        this.addVisualMarkers(scene2D);
    }

    /**
     * Add visual markers at key positions for comparison
     */
    private addVisualMarkers(scene2D: Scene): void {
        console.log("\n--- Visual Markers ---");

        // Marker at origin (0, 0)
        const markerOrigin = new Sprite();
        markerOrigin.graphics.drawCircle(0, 0, 5, "#00ff00");
        markerOrigin.pos(0, 0);
        scene2D.addChild(markerOrigin);

        // Marker at center (width/2, height/2)
        const markerCenter = new Sprite();
        markerCenter.graphics.drawCircle(0, 0, 5, "#0000ff");
        markerCenter.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        scene2D.addChild(markerCenter);

        // Marker at bottom-right (width, height)
        const markerBottomRight = new Sprite();
        markerBottomRight.graphics.drawCircle(0, 0, 5, "#ffff00");
        markerBottomRight.pos(Laya.stage.width, Laya.stage.height);
        scene2D.addChild(markerBottomRight);

        console.log("Visual markers added:");
        console.log("  Green = Origin (0, 0)");
        console.log("  Blue = Center (width/2, height/2)");
        console.log("  Yellow = Bottom-right (width, height)");
    }

    /**
     * 测试多个3D子节点
     */
    private testMultiple3DChildren(bridge: Bridge3DSprite): void {
        console.log("\n--- Test: Multiple 3D Children ---");

        // 创建父节点
        const parent3D = new Sprite3D("Parent");
        parent3D.transform.localPosition = new Vector3(0, 0, 0);
        bridge.addChild(parent3D);

        // 创建多个子立方体
        for (let i = 0; i < 3; i++) {
            const cube = new MeshSprite3D(PrimitiveMesh.createSphere(30));
            cube.name = `Cube${i}`;

            // 创建材质
            const material = new BlinnPhongMaterial();
            const hue = i / 3;
            material.albedoColor = new Color(hue, 0.5, 1 - hue, 1.0);
            cube.meshRenderer.material = material;

            // 设置位置
            cube.transform.localPosition = new Vector3((i - 1) * 80, 0, 0);

            // 添加为3D父节点的子节点
            parent3D.addChild(cube);
        }

        console.log(`Total Bridge3D children: ${bridge.numChildren}`);
        console.log(`Parent3D children: ${(parent3D as any)._children.length}`);

        // 测试查询
        const found = bridge.getChildByName("Parent");
        console.log(`Found by name "Parent": ${found !== null}`);

        const child0 = bridge.getChildAt(0);
        console.log(`First child name: ${child0.name}`);
    }

    /**
     * 测试动画
     */
    private testAnimation(bridge: Bridge3DSprite): void {
        console.log("\n--- Test: Animation ---");

        // 2D旋转动画
        bridge.addComponent(BridgeRotationScript);

        console.log("Started 2D rotation animation");
    }
}
