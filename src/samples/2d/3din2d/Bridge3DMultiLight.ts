import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Script } from "laya/components/Script";
import { PointLightCom } from "laya/d3/core/light/PointLightCom";
import { SpotLightCom } from "laya/d3/core/light/SpotLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Main } from "../../Main";

/**
 * 光源移动脚本
 * 让多个光源在场景中动态移动
 */
class LightMoveScript extends Script {
    lights: Sprite3D[] = [];
    offsets: Vector3[] = [];
    moveRanges: Vector3[] = [];

    onUpdate(): void {
        const seed: number = Laya.timer.currTimer * 0.002;
        for (let i = 0, n = this.lights.length; i < n; i++) {
            const transform: Transform3D = this.lights[i].transform;
            const pos: Vector3 = transform.localPosition;
            const off: Vector3 = this.offsets[i];
            const ran: Vector3 = this.moveRanges[i];
            pos.x = off.x + Math.sin(seed + i) * ran.x;
            pos.y = off.y + Math.sin(seed + i * 0.5) * ran.y;
            pos.z = off.z + Math.cos(seed + i) * ran.z;
            transform.localPosition = pos;
        }
    }
}

/**
 * Bridge3D多光源测试示例
 * 演示在2D/3D混合渲染环境中使用多个动态光源
 */
export class Bridge3DMultiLight {
    private bridge: Bridge3DSprite;
    private moveScript: LightMoveScript;

    constructor(maincls: typeof Main) {
        this.onLoaded(maincls);
    }

    private onLoaded(maincls: typeof Main): void {
        // console.log("Bridge3D MultiLight Test - Started");
        Laya.stage.bgColor = "#232628";

        // 创建2D场景
        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        // 创建Bridge3DSprite容器 (auto-creates Bridge3DScene3D)
        this.bridge = new Bridge3DSprite();
        this.bridge.pixelsPerUnit = 1;
        this.bridge.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        scene2D.addChild(this.bridge);

        // 设置环境光（较暗，以突出动态光源效果）
        (scene2D as any)._bridge3DInternal.scene3d.ambientColor = new Color(0.1, 0.1, 0.1, 1);

        // 创建3D场景内容
        this.create3DScene();

        // 创建多个点光源
        this.createPointLights(8);

        // 创建聚光灯
        this.createSpotLight();
    }

    /**
     * 创建3D场景内容
     * 包括地面和多个物体来展示光照效果
     */
    private create3DScene(): void {
        // 创建地面
        const ground = new MeshSprite3D(PrimitiveMesh.createPlane(400, 400, 10, 10));
        const groundMaterial = new BlinnPhongMaterial();
        groundMaterial.albedoColor = new Color(0.5, 0.5, 0.5, 1.0);
        ground.meshRenderer.material = groundMaterial;
        ground.transform.localPosition = new Vector3(0, -50, 0);
        ground.transform.localRotationEuler = new Vector3(90, 0, 0);  // Y-up: Rx(+90°) makes normal face +Z toward camera
        this.bridge.addChild(ground);

        // 创建中心球体
        const centerSphere = new MeshSprite3D(PrimitiveMesh.createSphere(40));
        const centerMaterial = new BlinnPhongMaterial();
        centerMaterial.albedoColor = new Color(0.8, 0.8, 0.8, 1.0);
        centerSphere.meshRenderer.material = centerMaterial;
        centerSphere.transform.localPosition = new Vector3(0, 0, 0);
        this.bridge.addChild(centerSphere);

        // 创建围绕中心的多个小球体
        const sphereCount = 6;
        const radius = 100;
        for (let i = 0; i < sphereCount; i++) {
            const angle = (i / sphereCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const sphere = new MeshSprite3D(PrimitiveMesh.createSphere(25));
            const material = new BlinnPhongMaterial();
            material.albedoColor = new Color(0.7, 0.7, 0.7, 1.0);
            sphere.meshRenderer.material = material;
            sphere.transform.localPosition = new Vector3(x, 0, z);
            this.bridge.addChild(sphere);
        }

        // 创建一些立方体
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const x = Math.cos(angle) * 70;
            const z = Math.sin(angle) * 70;

            const box = new MeshSprite3D(PrimitiveMesh.createBox(30, 30, 30));
            const material = new BlinnPhongMaterial();
            material.albedoColor = new Color(0.6, 0.6, 0.6, 1.0);
            box.meshRenderer.material = material;
            box.transform.localPosition = new Vector3(x, 20, z);
            this.bridge.addChild(box);
        }

    }

    /**
     * 创建多个点光源
     * @param count 光源数量
     */
    private createPointLights(count: number): void {
        // 创建光源移动脚本
        this.moveScript = this.bridge.addComponent(LightMoveScript);
        const moverLights: Sprite3D[] = this.moveScript.lights;
        const offsets: Vector3[] = this.moveScript.offsets;
        const moveRanges: Vector3[] = this.moveScript.moveRanges;

        moverLights.length = count;

        for (let i = 0; i < count; i++) {
            // 创建点光源
            const pointLightSprite = new Sprite3D();
            const pointCom = pointLightSprite.addComponent(PointLightCom);
            this.bridge.addChild(pointLightSprite);

            // 设置光源属性
            pointCom.range = 80 + Math.random() * 40;
            pointCom.color.setValue(
                Math.random() * 0.5 + 0.5,  // R: 0.5-1.0
                Math.random() * 0.5 + 0.5,  // G: 0.5-1.0
                Math.random() * 0.5 + 0.5,  // B: 0.5-1.0
                1
            );
            pointCom.intensity = 1.0 + Math.random() * 2.0;

            // 设置初始位置和移动范围
            moverLights[i] = pointLightSprite;
            offsets[i] = new Vector3(
                (Math.random() - 0.5) * 150,
                30 + Math.random() * 40,
                (Math.random() - 0.5) * 150
            );
            moveRanges[i] = new Vector3(
                (Math.random() - 0.5) * 60,
                10 + Math.random() * 20,
                (Math.random() - 0.5) * 60
            );

            // 创建可视化标记（小球体表示光源位置）
            const lightMarker = new MeshSprite3D(PrimitiveMesh.createSphere(5));
            const markerMaterial = new BlinnPhongMaterial();
            markerMaterial.albedoColor = new Color(
                pointCom.color.r,
                pointCom.color.g,
                pointCom.color.b,
                1.0
            );
            lightMarker.meshRenderer.material = markerMaterial;
            pointLightSprite.addChild(lightMarker);
        }
    }

    /**
     * 创建聚光灯
     */
    private createSpotLight(): void {
        const spotLight = new Sprite3D();
        const spotCom = spotLight.addComponent(SpotLightCom);
        this.bridge.addChild(spotLight);

        // 设置聚光灯位置和方向
        spotLight.transform.localPosition = new Vector3(0, 150, 0);
        spotLight.transform.localRotationEuler = new Vector3(-90, 0, 0);

        // 设置聚光灯属性
        spotCom.color.setValue(1.0, 0.9, 0.7, 1);  // 暖白色
        spotCom.range = 200;
        spotCom.intensity = 2.0;
        spotCom.spotAngle = 45;

        // 创建可视化标记（锥形表示聚光灯）
        const spotMarker = new MeshSprite3D(PrimitiveMesh.createCone(10, 20));
        const markerMaterial = new BlinnPhongMaterial();
        markerMaterial.albedoColor = new Color(1.0, 0.9, 0.7, 1.0);
        spotMarker.meshRenderer.material = markerMaterial;
        spotMarker.transform.localRotationEuler = new Vector3(180, 0, 0);
        spotLight.addChild(spotMarker);
    }
}
