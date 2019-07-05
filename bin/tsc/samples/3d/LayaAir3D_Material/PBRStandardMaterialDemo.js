import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector4 } from "laya/d3/math/Vector4";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author ...
 */
export class PBRStandardMaterialDemo {
    constructor() {
        Shader3D.debugMode = true;
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        Scene3D.load("res/threeDimen/scene/PBRMaterialScene/Showcase.ls", Handler.create(this, function (scene) {
            Laya.stage.addChild(scene);
            var camera = scene.getChildByName("Main Camera");
            camera.addComponent(CameraMoveScript);
            camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
            BaseMaterial.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Handler.create(this, function (mat) {
                var skyRenderer = camera.skyRenderer;
                skyRenderer.mesh = SkyBox.instance;
                skyRenderer.material = mat;
            }));
            //实例PBR材质
            var mat = new PBRStandardMaterial();
            //albedoTexture:法线贴图：增强模型细节
            //反射贴图
            Texture2D.load('res/threeDimen/scene/PBRMaterialScene/Assets/PBR Barrel/Materials/Textures/Barrel_AlbedoTransparency.png', Handler.create(this, function (texture) {
                mat.albedoTexture = texture;
            }));
            //法线贴图
            Texture2D.load('res/threeDimen/scene/PBRMaterialScene/Assets/PBR Barrel/Materials/Textures/Barrel_Normal.png', Handler.create(this, function (texture) {
                mat.normalTexture = texture;
            }));
            //金属光滑度贴图
            Texture2D.load('res/threeDimen/scene/PBRMaterialScene/Assets/PBR Barrel/Materials/Textures/Barrel_MetallicSmoothness.png', Handler.create(this, function (texture) {
                mat.metallicGlossTexture = texture;
            }));
            //遮挡贴图
            Texture2D.load('res/threeDimen/scene/PBRMaterialScene/Assets/PBR Barrel/Materials/Textures/Barrel_Occlusion.png', Handler.create(this, function (texture) {
                mat.occlusionTexture = texture;
            }));
            //反射颜色
            mat.albedoColor = new Vector4(1, 1, 1, 1);
            //光滑度缩放系数
            mat.smoothnessTextureScale = 1.0;
            //遮挡贴图强度
            mat.occlusionTextureStrength = 1.0;
            //法线贴图缩放系数
            //mat.normalScale = 1;
            //光滑度数据源:从金属度贴图/反射贴图获取。
            mat.smoothnessSource = PBRStandardMaterial.SmoothnessSource_MetallicGlossTexture_Alpha;
            var barrel = scene.getChildByName("Wooden_Barrel");
            var barrel1 = scene.getChildByName("Wooden_Barrel (1)");
            var barrel2 = scene.getChildByName("Wooden_Barrel (2)");
            var barrel3 = scene.getChildByName("Wooden_Barrel (3)");
            barrel.meshRenderer.sharedMaterial = mat;
            barrel1.meshRenderer.sharedMaterial = mat;
            barrel2.meshRenderer.sharedMaterial = mat;
            barrel3.meshRenderer.sharedMaterial = mat;
        }));
    }
}
