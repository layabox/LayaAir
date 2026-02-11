import { Laya } from "../../../layaAir/Laya";
import { Bridge3DSprite } from "../../../layaAir/laya/bridge/Bridge3DSprite";
import { Bridge3DCoordinate } from "../../../layaAir/laya/bridge/utils/Bridge3DCoordinate";
import { DirectionLightCom } from "../../../layaAir/laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "../../../layaAir/laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "../../../layaAir/laya/d3/core/MeshSprite3D";
import { Sprite3D } from "../../../layaAir/laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "../../../layaAir/laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "../../../layaAir/laya/display/Scene";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Color } from "../../../layaAir/laya/maths/Color";
import { Matrix4x4 } from "../../../layaAir/laya/maths/Matrix4x4";
import { Vector3 } from "../../../layaAir/laya/maths/Vector3";
import { Vector4 } from "../../../layaAir/laya/maths/Vector4";


/**
 * Bridge3D测试示例
 * 演示基础的2D/3D混合渲染功能
 */
export class Bridge3DTest {
    constructor() {
        // 初始化Laya
        Laya.init(800, 600).then(() => {
            this.onLoaded();
        });
    }

    private onLoaded(): void {
        console.log("Bridge3D Test - Started");

        // Output coordinate system debug info
        Bridge3DCoordinate.debugInfo();

        // Create 2D scene (Scene now has built-in Bridge3DScene3D support via auto-initialization)
        const scene2D = new Scene();
        Laya.stage.addChild(scene2D);

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

        // 添加到Bridge3D
        bridge.addChild(cube);

        console.log("3D cube added to Bridge3D");
        console.log(`Number of 3D children: ${bridge.numChildren}`);

        // 测试多个3D子节点
        this.testMultiple3DChildren(bridge);

        // 测试动画
        this.testAnimation(bridge);

        console.log("Bridge3D Test - All tests initiated");

        // Run diagnostic tests
        this.addVisualMarkers(scene2D);
        this.logCameraState(scene2D);
        this.testWorldToScreen(scene2D);
        this.logTransformChain(bridge);
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
     * Log camera state and projection parameters
     */
    private logCameraState(scene2D: Scene): void {
        const scene3d = scene2D.bridge3D;
        if (!scene3d) return;

        const camera = scene3d.sharedCamera;
        const stage = Laya.stage;

        console.log("\n--- Camera State ---");
        console.log(`Position: (${camera.transform.position.x}, ${camera.transform.position.y}, ${camera.transform.position.z})`);
        console.log(`Rotation: (${camera.transform.rotationEuler.x}, ${camera.transform.rotationEuler.y}, ${camera.transform.rotationEuler.z})`);
        console.log(`Orthographic: ${camera.orthographic}`);
        console.log(`Orthographic Vertical Size: ${camera.orthographicVerticalSize}`);
        console.log(`Near/Far: ${camera.nearPlane} / ${camera.farPlane}`);
        console.log(`Aspect Ratio: ${stage.width / stage.height}`);
    }

    /**
     * Test 3D world to screen space coordinate projection
     */
    private testWorldToScreen(scene2D: Scene): void {
        const scene3d = scene2D.bridge3D;
        if (!scene3d) return;

        const camera = scene3d.sharedCamera;
        const stage = Laya.stage;

        // Test positions
        const testPositions = [
            { name: "Origin", pos: new Vector3(0, 0, 0) },
            { name: "Center", pos: new Vector3(stage.width/2, stage.height/2, 0) },
            { name: "BottomRight", pos: new Vector3(stage.width, stage.height, 0) },
            { name: "BehindCamera", pos: new Vector3(0, 0, -200) }, // 在相机后面
            { name: "TooClose", pos: new Vector3(0, 0, -50) }, // 在近平面之前
        ];

        console.log("\n--- 3D World to Screen Projection Test ---");
        console.log(`Stage size: ${stage.width} x ${stage.height}`);
        console.log(`Camera position: (${camera.transform.position.x}, ${camera.transform.position.y}, ${camera.transform.position.z})`);
        console.log(`Camera rotation: (${camera.transform.rotationEuler.x}, ${camera.transform.rotationEuler.y}, ${camera.transform.rotationEuler.z})`);

        for (const test of testPositions) {
            const screenPos = new Vector4();
            // worldToViewportPoint 直接接受世界坐标
            camera.worldToViewportPoint(test.pos, screenPos);

            // Convert viewport (0-1) to screen pixels
            const screenX = screenPos.x;
            const screenY = screenPos.y;
            const depth = screenPos.z;

            // 判断深度值是否有效
            const isVisible = depth >= 0 && depth <= 1;
            const depthStatus = depth < 0 ? "(TOO CLOSE - 在近平面之前)" :
                               depth > 1 ? "(TOO FAR - 在远平面之后)" :
                               "(VISIBLE - 可见)";

            console.log(`${test.name} (${test.pos.x}, ${test.pos.y}, ${test.pos.z})`);
            console.log(`  → Viewport: (${screenPos.x.toFixed(3)}, ${screenPos.y.toFixed(3)})`);
            console.log(`  → Screen: (${screenX.toFixed(1)}, ${screenY.toFixed(1)})`);
            console.log(`  → Depth: ${depth.toFixed(3)} ${depthStatus}`);
        }
    }

    /**
     * Log transform chain from Bridge3D to 3D children
     */
    private logTransformChain(bridge: Bridge3DSprite): void {
        console.log("\n--- Transform Chain ---");
        console.log(`Bridge3DSprite 2D position: (${bridge.x}, ${bridge.y})`);
        console.log(`Bridge3DSprite 2D rotation: ${bridge.rotation}`);
        console.log(`Bridge3DSprite 2D scale: (${bridge.scaleX}, ${bridge.scaleY})`);

        const container = bridge.containerSprite3D;
        console.log(`\ncontainerSprite3D local position: (${container.transform.localPosition.x}, ${container.transform.localPosition.y}, ${container.transform.localPosition.z})`);
        console.log(`containerSprite3D world position: (${container.transform.position.x}, ${container.transform.position.y}, ${container.transform.position.z})`);
        console.log(`containerSprite3D local rotation: (${container.transform.localRotationEuler.x}, ${container.transform.localRotationEuler.y}, ${container.transform.localRotationEuler.z})`);
        console.log(`containerSprite3D local scale: (${container.transform.localScale.x}, ${container.transform.localScale.y}, ${container.transform.localScale.z})`);

        // Log first child (the sphere)
        if (bridge.numChildren > 0) {
            const child = bridge.getChildAt(0) as any;
            console.log(`\nFirst 3D child (${child.name || 'unnamed'}):`);
            console.log(`  Local position: (${child.transform.localPosition.x}, ${child.transform.localPosition.y}, ${child.transform.localPosition.z})`);
            console.log(`  World position: (${child.transform.position.x}, ${child.transform.position.y}, ${child.transform.position.z})`);
        }
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
        let angle = 0;
        Laya.timer.frameLoop(1, this, () => {
            angle += 10;
            bridge.rotation = angle;
        });

        console.log("Started 2D rotation animation");
    }
}
