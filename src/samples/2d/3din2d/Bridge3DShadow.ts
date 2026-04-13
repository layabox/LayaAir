
import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Script } from "laya/components/Script";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Main } from "../../Main";

/**
 * 光源旋转脚本
 * 让方向光旋转以展示动态阴影效果
 */
class LightRotationScript extends Script {
    /** 旋转速度 */
    autoRotateSpeed: Vector3 = new Vector3(0, 0.03, 0);
    /** 是否旋转 */
    rotation: boolean = true;

    onUpdate(): void {
        if (this.rotation) {
            (this.owner as Sprite3D).transform.rotate(this.autoRotateSpeed, false);
        }
    }
}

/**
 * 物体旋转脚本
 * 让物体自转以展示阴影变化
 */
class ObjectRotationScript extends Script {
    rotationSpeed: Vector3 = new Vector3(0, 0.1, 0);

    onUpdate(): void {
        (this.owner as Sprite3D).transform.rotate(this.rotationSpeed, false);
    }
}

/**
 * Bridge3D实时阴影测试示例
 * 演示在2D/3D混合渲染环境中的实时阴影效果
 */
export class Bridge3DShadow {
    private bridge: Bridge3DSprite;
    private directionLight: Sprite3D;
    private lightRotationScript: LightRotationScript;

    constructor(maincls: typeof Main) {
        this.onLoaded(maincls);
    }

    private onLoaded(maincls: typeof Main): void {
        // console.log("Bridge3D Shadow Test - Started");

        Laya.stage.bgColor = "#232628";

        // 创建2D场景
        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        // 创建Bridge3DSprite容器 (auto-creates Bridge3DScene3D)
        this.bridge = new Bridge3DSprite();
        this.bridge.pixelsPerUnit = 1;
        this.bridge.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        scene2D.addChild(this.bridge);

        // 设置环境光（较暗，以突出阴影效果）
        const scene3d = (scene2D as any)._bridge3DInternal.scene3d;
        scene3d._applyCameraZDistance(300);
        scene3d.ambientColor = new Color(0.3, 0.3, 0.3, 1);

        // console.log(`Bridge3D created at (${this.bridge.x}, ${this.bridge.y})`);

        // 创建方向光并配置阴影
        this.createDirectionLight();

        // 创建3D场景内容
        this.create3DScene();

        // console.log("Bridge3D Shadow Test - Scene created");
    }

    /**
     * 创建方向光并配置阴影
     */
    private createDirectionLight(): void {
        this.directionLight = new Sprite3D();
        const directionLightCom = this.directionLight.addComponent(DirectionLightCom);
        this.bridge.addChild(this.directionLight);

        // 设置光源颜色和强度
        directionLightCom.color = new Color(0.9, 0.9, 0.85, 1);
        directionLightCom.intensity = 1.0;

        // 设置光源方向（从上方斜照）
        this.directionLight.transform.localRotationEuler = new Vector3(-45, 30, 0);

        // 配置阴影参数
        directionLightCom.shadowMode = ShadowMode.SoftLow;  // 使用软阴影
        directionLightCom.shadowDistance = 500;  // 阴影最大距离
        directionLightCom.shadowResolution = 2048;  // 阴影分辨率
        directionLightCom.shadowCascadesMode = ShadowCascadesMode.NoCascades;  // 无级联
        directionLightCom.shadowNormalBias = 3;  // 法线偏移，减少阴影失真
        directionLightCom.shadowDepthBias = 1;  // 深度偏移

        // 添加光源旋转脚本
        this.lightRotationScript = this.directionLight.addComponent(LightRotationScript);

    }

    /**
     * 创建3D场景内容
     * 包括接收阴影的地面和投射阴影的物体
     */
    private create3DScene(): void {
        // 创建地面（接收阴影）
        const ground = new MeshSprite3D(PrimitiveMesh.createPlane(500, 500, 20, 20));
        const groundMaterial = new PBRStandardMaterial();
        groundMaterial.albedoColor = new Color(0.7, 0.7, 0.7, 1.0);
        groundMaterial.smoothness = 0.3;
        groundMaterial.metallic = 0.0;
        ground.meshRenderer.material = groundMaterial;
        ground.meshRenderer.receiveShadow = true;  // 接收阴影
        ground.transform.localPosition = new Vector3(0, -80, 0);
        ground.transform.localRotationEuler = new Vector3(90, 0, 0);  // Y-up: Rx(+90°) makes normal face +Z toward camera
        this.bridge.addChild(ground);

        // 创建中心球体（投射和接收阴影）
        const centerSphere = new MeshSprite3D(PrimitiveMesh.createSphere(50));
        const sphereMaterial = new PBRStandardMaterial();
        sphereMaterial.albedoColor = new Color(0.8, 0.3, 0.3, 1.0);
        sphereMaterial.smoothness = 0.5;
        sphereMaterial.metallic = 0.2;
        centerSphere.meshRenderer.material = sphereMaterial;
        centerSphere.meshRenderer.castShadow = true;  // 投射阴影
        centerSphere.meshRenderer.receiveShadow = true;  // 接收阴影
        centerSphere.transform.localPosition = new Vector3(0, -30, 0);  // r=50, bottom at y=-80 (on ground)
        this.bridge.addChild(centerSphere);

        // 创建围绕中心的立方体（投射阴影）
        const cubeCount = 1;
        const radius = 120;
        for (let i = 0; i < cubeCount; i++) {
            const angle = (i / cubeCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const box = new MeshSprite3D(PrimitiveMesh.createBox(40, 60, 40));
            const material = new PBRStandardMaterial();
            const hue = i / cubeCount;
            material.albedoColor = new Color(
                0.5 + hue * 0.5,
                0.5 + (1 - hue) * 0.5,
                0.5,
                1.0
            );
            material.smoothness = 0.4;
            material.metallic = 0.1;
            box.meshRenderer.material = material;
            box.meshRenderer.castShadow = true;  // 投射阴影
            box.meshRenderer.receiveShadow = true;  // 接收阴影
            box.transform.localPosition = new Vector3(x, -50, z);  // h=60, bottom at y=-80 (on ground)

            // 添加旋转脚本
            const rotScript = box.addComponent(ObjectRotationScript);
            rotScript.rotationSpeed = new Vector3(0, 0.01, 0);

            this.bridge.addChild(box);
        }

        // 创建悬浮的小球体（投射阴影）
        const floatingSpheres = 4;
        for (let i = 0; i < floatingSpheres; i++) {
            const angle = (i / floatingSpheres) * Math.PI * 2 + Math.PI / 4;
            const x = Math.cos(angle) * 80;
            const z = Math.sin(angle) * 80;
            const y = 60 + Math.sin(i) * 20;

            const sphere = new MeshSprite3D(PrimitiveMesh.createSphere(20));
            const material = new PBRStandardMaterial();
            material.albedoColor = new Color(0.3, 0.6, 0.9, 1.0);
            material.smoothness = 0.8;
            material.metallic = 0.5;
            sphere.meshRenderer.material = material;
            sphere.meshRenderer.castShadow = true;  // 投射阴影
            sphere.transform.localPosition = new Vector3(x, y, z);

            // 添加旋转脚本
            const rotScript = sphere.addComponent(ObjectRotationScript);
            rotScript.rotationSpeed = new Vector3(1, 0.5, 0);

            this.bridge.addChild(sphere);
        }

        // 创建一个高塔（投射长阴影）
        const tower = new MeshSprite3D(PrimitiveMesh.createCylinder(15, 100));
        const towerMaterial = new PBRStandardMaterial();
        towerMaterial.albedoColor = new Color(0.6, 0.5, 0.4, 1.0);
        towerMaterial.smoothness = 0.2;
        towerMaterial.metallic = 0.0;
        tower.meshRenderer.material = towerMaterial;
        tower.meshRenderer.castShadow = true;  // 投射阴影
        tower.meshRenderer.receiveShadow = true;  // 接收阴影
        tower.transform.localPosition = new Vector3(-150, -30, 0);
        this.bridge.addChild(tower);
    }

    /**
     * 切换光源旋转
     */
    public toggleLightRotation(): void {
        this.lightRotationScript.rotation = !this.lightRotationScript.rotation;
        console.log(`Light rotation: ${this.lightRotationScript.rotation ? "enabled" : "disabled"}`);
    }
}
