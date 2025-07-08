import { Laya, stage } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Material } from "laya/resource/Material";
import { PseudoRandom } from "../common/PseudoRandom";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import { Scene } from "laya/display/Scene";
import { PBRMaterial } from "laya/d3/core/material/PBRMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";

export class InstanceAndUBO {
    private scene: Scene3D;
    private camera: Camera;
    private instanceCount: number = 2000;
    private instanceList: Sprite3D[] = [];
    private rotationSpeed: number = 0.5;
    private material: Material;
    private random: PseudoRandom;
    private seed: number = 1748955529154;
    private meshUrl: string = "res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm";
    private lsUrl: string = "res/threeDimen/scene/LayaScene_EmptyScene/Conventional/EmptyScene.ls";

    constructor() {
        this.random = new PseudoRandom(this.seed);
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();

            // 加载shader
            Laya.loader.load(["res/shaders/3d/PBRColorBatchShader.shader", this.meshUrl, this.lsUrl], Handler.create(this, this.onShaderLoaded));
        });
    }

    private onShaderLoaded(): void {
        let prefab: PrefabImpl = Laya.loader.getRes(this.lsUrl);
        // 创建场景
        let scene2d = (<Scene>prefab.create());
        this.scene = scene2d.scene3D;
        Laya.stage.addChild(this.scene);

        this.camera = this.scene.getChildByName("Main Camera") as Camera;
        this.camera.clearFlag = CameraClearFlags.SolidColor;
        this.camera.clearColor = new Color(0.6, 0.8, 1.0, 1.0); // 浅蓝色

        // 调整相机位置
        let cameraPos = this.camera.transform.position;
        let cameraForward = new Vector3();
        this.camera.transform.getForward(cameraForward);
        cameraForward.scale(-45, cameraForward);

        this.camera.transform.position = new Vector3(
            cameraPos.x + cameraForward.x,
            cameraPos.y + cameraForward.y,
            cameraPos.z + cameraForward.z
        );

        this.camera.addComponent(CameraMoveScript);

        // 创建实例化对象
        this.createInstances();
    }

    private createInstances(): void {
        // 创建基础网格
        const monkeyMesh = Laya.loader.getRes(this.meshUrl);
        const sphereMesh = PrimitiveMesh.createSphere(0.5);
        const capsuleMesh = PrimitiveMesh.createCapsule(0.5, 1.0);
        const cubeMesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);

        // 创建材质
        this.material = new Material();
        this.material.setShaderName("PBRColorBatchShader");

        // 创建颜色缓冲区
        const colorBuffer = new Float32Array(20 * 4); // 20个颜色
        for (let i = 0; i < 20; i++) {
            const offset = i * 4;
            colorBuffer[offset] = this.random.random();     // R
            colorBuffer[offset + 1] = this.random.random(); // G
            colorBuffer[offset + 2] = this.random.random(); // B
            colorBuffer[offset + 3] = 1.0;                  // A
        }

        // 创建金属度和光滑度缓冲区
        const metallicSmoothnessBuffer = new Float32Array(20 * 4); // 20个实例的金属度和光滑度
        for (let i = 0; i < 20; i++) {
            const offset = i * 4;
            metallicSmoothnessBuffer[offset] = this.random.random();     // Metallic
            metallicSmoothnessBuffer[offset + 1] = this.random.random(); // Smoothness
            metallicSmoothnessBuffer[offset + 2] = 0.0;
            metallicSmoothnessBuffer[offset + 3] = 0.0;
        }

        // 设置UBO数据
        this.material.setBuffer("colormap", colorBuffer);
        this.material.setBuffer("metallicSmoothnessMap", metallicSmoothnessBuffer);

        const range = 70;
        const radius = 360;

        // 创建猴子实例
        for (let i = 0; i < this.instanceCount; i++) {
            const instance = new Sprite3D();
            const meshFilter = instance.addComponent(MeshFilter);
            const meshRenderer = instance.addComponent(MeshRenderer);

            // 随机选择网格
            const meshType = this.random.range(0, 10);
            if (meshType < 5) {
                meshFilter.sharedMesh = monkeyMesh;
            } else if (meshType < 6) {
                meshFilter.sharedMesh = sphereMesh;
            } else if (meshType < 8) {
                meshFilter.sharedMesh = capsuleMesh;
            } else {
                meshFilter.sharedMesh = cubeMesh;
            }
            meshRenderer.sharedMaterial = this.material;
            meshRenderer.setNodeCustomData(0, this.random.intRange(0, 20)); // 设置随机颜色索引
            meshRenderer.setNodeCustomData(1, this.random.intRange(0, 20)); // 设置随机金属度和光滑度索引

            // 随机位置
            const x = this.random.range(-range / 2, range / 2);
            const y = this.random.range(-range / 2, range / 2);
            const z = this.random.range(-range / 2, range / 2);
            instance.transform.localPosition = new Vector3(x, y, z);

            // 随机旋转
            const rotX = this.random.range(0, radius);
            const rotY = this.random.range(0, radius);
            const rotZ = this.random.range(0, radius);
            instance.transform.rotationEuler = new Vector3(rotX, rotY, rotZ);

            // 随机缩放
            const scale = this.random.range(0.5, 1.5);
            instance.transform.localScale = new Vector3(scale, scale, scale);

            this.scene.addChild(instance);
            this.instanceList.push(instance);
        }
    }
} 