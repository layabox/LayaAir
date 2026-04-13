/**
description
 演示 Bridge3DSprite 中的 PBR 材质效果：展示不同金属度和光滑度的球体矩阵渲染。
 从已加载的 Scene3D 中读取球谐光照（SH）参数并应用到 Bridge3D 场景，
 同时设置 IBL 反射贴图以获得真实感环境反射，球体矩阵持续旋转展示效果。
 */

import { Laya } from "Laya";
import { Bridge3DScene3D } from "laya/bridge/Bridge3DScene3D";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Script } from "laya/components/Script";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { AmbientMode } from "laya/d3/core/scene/AmbientMode";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Scene } from "laya/display/Scene";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Main } from "../../Main";

/**
 * 球体网格旋转脚本
 * 让整个 PBR 球体矩阵缓慢旋转以展示 IBL 反射随视角的变化效果
 */
class PBRGridRotation extends Script {
    rotationSpeed: Vector3 = new Vector3(0, 0.004, 0);

    onUpdate(): void {
        (this.owner as Sprite3D).transform.rotate(this.rotationSpeed, false);
    }
}

/**
 * Bridge3D PBR 材质矩阵演示
 *
 * 布局说明：
 *   - 横轴（列）：光滑度 0 → 1（左→右）
 *   - 纵轴（行）：金属度 0 → 1（下→上）
 *
 * 环境光说明：
 *   1. 从 Scene3D.load() 加载的场景中同时读取球谐光照系数和 IBL 反射贴图
 *   2. 若场景未携带 SH 数据，则回退使用预设的 DawnDusk 球谐系数
 *   3. IBL 贴图先赋值给 bridge3D 再销毁源场景，保持贴图引用计数有效
 */
export class Bridge3DPBRMaterial {
    /** Bridge3DSprite 容器，承载全部 3D 内容 */
    private bridge: Bridge3DSprite;
    /** 当前 2D 场景引用，用于跨异步回调访问 bridge3D */
    private scene2D: Scene;

    /** 球体列数（光滑度维度，与 PBRMaterialDemo 一致） */
    private readonly COLS = 6;
    /** 球体间距（像素/3D 单位，scale3DToPixel=1 时相等） */
    private readonly SPACING = 65;
    /** 球体半径 */
    private readonly SPHERE_RADIUS = 25;

    constructor(maincls: typeof Main) {
        this.onLoaded(maincls);
    }

    private onLoaded(maincls: typeof Main): void {
        Laya.stage.bgColor = "#232628";

        // 创建 2D 场景
        this.scene2D = new Scene();
        maincls.box2D.addChild(this.scene2D);

        // 创建 Bridge3DSprite：scale3DToPixel=1 表示 1 个 3D 单位对应 1 像素
        this.bridge = new Bridge3DSprite();
        this.bridge.pixelsPerUnit = 1;
        this.bridge.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.scene2D.addChild(this.bridge);

        // 设置相机 Z 距离
        // 球体矩阵宽约 5*SPACING=325px，高约 4*SPACING=260px，需足够远才能全部入镜
        (this.scene2D.bridge3DInternal.scene3d as any)._applyCameraZDistance(600);

        // 添加方向光提供基础漫反射
        this.createDirectionLight();

        // 从外部场景文件同时读取球谐光照参数和 IBL 反射贴图
        this.loadSceneForEnvData();
    }

    /**
     * 添加方向光，补充 IBL 漫反射的高光细节
     */
    private createDirectionLight(): void {
        const lightSprite = new Sprite3D();
        const dircom = lightSprite.addComponent(DirectionLightCom);
        dircom.color = new Color(0.5, 0.5, 0.5, 1);
        dircom.intensity = 0.8;
        // 从左上方照射
        lightSprite.transform.localRotationEuler = new Vector3(-45, 30, 0);
        this.bridge.addChild(lightSprite);
    }

    /**
     * 加载外部 .ls 场景文件，同时读取其中烘焙的球谐光照系数和 IBL 反射贴图，
     * 并将它们应用到 Bridge3D 场景。
     *
     * 注意：iblTex 需在 loadedScene.destroy() 之前赋值给 bridge3D，
     * 确保贴图引用计数不归零，避免 GPU 资源被提前释放。
     * 场景仅用于提取环境数据，不加入舞台。
     */
    private loadSceneForEnvData(): void {
        Scene3D.load(
            "res/threeDimen/scene/LayaScene_EmptyScene/Conventional/EmptyScene.ls",
            Handler.create(this, (loadedScene: Scene3D) => {
                const scene3d = this.scene2D.bridge3DInternal.scene3d;

                // ---- 球谐光照 ----
                const shFromScene = loadedScene.ambientSH;
                scene3d.ambientSH = new Float32Array(shFromScene);
                console.log("[Bridge3DPBRMaterial] 球谐光照已从场景读取");

                scene3d.ambientMode = AmbientMode.SphericalHarmonics;

                // ---- IBL 反射贴图 ----
                // 先赋值给 bridge3D scene3d，再销毁源场景，保证引用计数有效
                const iblTex = loadedScene.sceneReflectionProb.iblTex;
                if (iblTex) {
                    scene3d.sceneReflectionProb.iblTex = iblTex;
                    scene3d.sceneReflectionProb.reflectionIntensity = 1.0;
                    console.log("[Bridge3DPBRMaterial] IBL 反射贴图已从场景读取");
                } else {
                    console.log("[Bridge3DPBRMaterial] 场景无 IBL 贴图，跳过反射设置");
                }

                // 释放源场景（环境数据已全部迁移）
                loadedScene.destroy();

                this.createPBRSphereGrid();
            })
        );
    }

    /**
     * 创建 PBR 球体矩阵并绑定旋转脚本。
     *
     * 布局与 PBRMaterialDemo 对齐（5 行 × 6 列）：
     *   顶行：铜色 + metallic=1.0（完全导体，高光反射为有色）
     *   中间3行：白色 + metallic 依次为 1.0 / 0.5 / 0.0
     *   底行：黑色 + metallic=0.0（完全电介质，仅漫反射）
     *   横轴（每行）：smoothness 0 → 1（左→右）
     */
    private createPBRSphereGrid(): void {
        const sphereMesh = PrimitiveMesh.createSphere(this.SPHERE_RADIUS, 32, 32);

        // 使用单一容器节点统一控制旋转
        const container = new Sprite3D("PBRGrid");
        container.addComponent(PBRGridRotation);
        this.bridge.addChild(container);

        const copperColor = new Color(186 / 255, 110 / 255, 64 / 255, 1.0);
        const whiteColor = new Color(1.0, 1.0, 1.0, 1.0);
        const blackColor = new Color(0.0, 0.0, 0.0, 1.0);

        // 行定义：[颜色, metallic, y 偏移]，与 PBRMaterialDemo 的三组行对应
        const rowDefs: [Color, number, number][] = [
            [copperColor, 1.0, 2 * this.SPACING],  // 顶行：铜色，完全金属
            [whiteColor, 1.0, 1 * this.SPACING],  // 白色 metallic=1.0
            [whiteColor, 0.5, 0],                  // 白色 metallic=0.5
            [whiteColor, 0.0, -1 * this.SPACING],  // 白色 metallic=0.0
            [blackColor, 0.0, -2 * this.SPACING],  // 底行：黑色，完全非金属
        ];

        for (const [color, metallic, yOffset] of rowDefs) {
            for (let i = 0; i < this.COLS; i++) {
                const smoothness = i / (this.COLS - 1);
                const sphere = new MeshSprite3D(sphereMesh);
                const mat = new PBRStandardMaterial();
                mat.albedoColor = color;
                mat.metallic = metallic;
                mat.smoothness = smoothness;
                sphere.meshRenderer.material = mat;

                const x = (i - (this.COLS - 1) / 2) * this.SPACING;
                sphere.transform.localPosition = new Vector3(x, yOffset, 0);
                container.addChild(sphere);
            }
        }

        console.log(
            "[Bridge3DPBRMaterial] PBR 球体矩阵创建完成：5 行 × 6 列",
            "\n  横轴：光滑度 0 → 1（左→右）",
            "\n  顶行：铜色 metallic=1.0 | 中间：白色 metallic 1→0 | 底行：黑色 metallic=0.0"
        );
    }
}
