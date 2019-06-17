import { Laya } from "Laya";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CartoonMaterial } from "laya/d3Extend/cartoonMaterial/CartoonMaterial";
/**
 * ...
 * @author
 */
export class CartoonRender {
    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        CartoonMaterial.initShader();
        Scene3D.load("res/threeDimen/cartoon/CartoonTest.ls", Handler.create(null, function (scene) {
            Laya.stage.addChild(scene);
            //获取场景相机
            var camera = scene.getChildByName("Main Camera");
            camera.addComponent(CameraMoveScript);
            //添加光照
            var directionLight = scene.addChild(new DirectionLight());
            directionLight.color = new Vector3(1, 1, 1);
            directionLight.transform.rotate(new Vector3(-1.14 / 3, 0, 0));
            this.kiana = scene.getChildByName("Kiana");
            this.setkianaCartoon();
        }));
    }
    setkianaCartoon() {
        var kiana_Cartoon = this.kiana.getChildByName("Kiana_Cartoon");
        var kiana_cartoon_face = kiana_Cartoon.getChildByName("Face");
        var kiana_cartoon_hair = kiana_Cartoon.getChildByName("Hair");
        var kiana_cartoon_body = kiana_Cartoon.getChildByName("Body");
        var faceMaterial = new CartoonMaterial();
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C1_Texture_Face_Color_Common.png", Handler.create(null, function (tex) {
            faceMaterial.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C1_Texture_Face_LightMap_Common.png", Handler.create(null, function (tex) {
            faceMaterial.blendTexture = tex;
        }));
        faceMaterial.shadowColor = new Vector4(0.8, 0.8, 0.8, 1.0);
        faceMaterial.shadowRange = 0.188;
        faceMaterial.shadowIntensity = 0.88;
        faceMaterial.specularRange = 0.9955;
        faceMaterial.specularIntensity = 0.99;
        //faceMaterial.outlineTexture = Texture2D.load("CartoonRender2/Assets/CartoonTest/Texture/Avatar_Yae_sakura_C1_Texture_Body_LightMap_1ShadowColor.png");
        faceMaterial.outlineWidth = 0.002;
        faceMaterial.outlineLightness = 0.25;
        var hairMaterial = new CartoonMaterial();
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C2_Texture_Hair_Color_Common.png", Handler.create(null, function (tex) {
            hairMaterial.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C2_Texture_Hair_LightMap_Common.png", Handler.create(null, function (tex) {
            hairMaterial.blendTexture = tex;
        }));
        hairMaterial.shadowColor = new Vector4(0.8, 0.8, 0.8, 1.0);
        hairMaterial.shadowRange = 0.27;
        hairMaterial.shadowIntensity = 0.7956449;
        hairMaterial.specularRange = 0.9820514;
        hairMaterial.specularIntensity = 1.0;
        //hairMaterial.outlineTexture = Texture2D.load("CartoonRender2/Assets/CartoonTest/Texture/Avatar_Yae_sakura_C1_Texture_Body_LightMap_1ShadowColor.png");
        hairMaterial.outlineWidth = 0.002;
        hairMaterial.outlineLightness = 0.25;
        var bodyMaterial = new CartoonMaterial();
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C2_Texture_Body_Color_RGB2048.png", Handler.create(null, function (tex) {
            bodyMaterial.albedoTexture = tex;
        }));
        Texture2D.load("res/threeDimen/cartoon/Assets/CartoonTest/Texture/Avatar_Kiana_C2_Texture_Body_LightMap_Common.png", Handler.create(null, function (tex) {
            bodyMaterial.blendTexture = tex;
        }));
        bodyMaterial.shadowColor = new Vector4(0.8, 0.8, 0.8, 1.0);
        bodyMaterial.shadowRange = 0.046;
        bodyMaterial.shadowIntensity = 0.816;
        bodyMaterial.specularRange = 0.985;
        bodyMaterial.specularIntensity = 0.938;
        //bodyMaterial.outlineTexture = Texture2D.load("CartoonRender2/Assets/CartoonTest/Texture/Avatar_Yae_sakura_C1_Texture_Body_LightMap_1ShadowColor.png");
        bodyMaterial.outlineWidth = 0.002;
        bodyMaterial.outlineLightness = 0.25;
        kiana_cartoon_face.meshRenderer.sharedMaterial = faceMaterial;
        kiana_cartoon_hair.meshRenderer.sharedMaterial = hairMaterial;
        kiana_cartoon_body.meshRenderer.sharedMaterial = bodyMaterial;
    }
}
