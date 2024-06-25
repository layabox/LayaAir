import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyProceduralMaterial } from "laya/d3/core/material/SkyProceduralMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { PostProcess } from "laya/d3/component/PostProcess";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { LensFlareEffect, LensFlareData, LensFlareElement } from "laya/d3/core/render/PostEffect/LensFlares/LensFlareEffect"
import { URL } from "laya/net/URL";
import { Handler } from "laya/utils/Handler";
import { Texture2D } from "laya/resource/Texture2D";
import { Vector2 } from "laya/maths/Vector2";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Loader } from "laya/net/Loader";
export class PostProcess_LensFlare {

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            //初始化3D场景
            var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
            //初始化天空渲染器
            var skyRenderer: SkyRenderer = scene.skyRenderer;
            //创建天空盒mesh
            skyRenderer.mesh = SkyDome.instance;
            //使用程序化天空盒
            let skymat = new SkyProceduralMaterial();
            skymat.sunDisk = SkyProceduralMaterial.SUN_HIGH_QUALITY;
            skyRenderer.material = skymat;

            //初始化相机并设置清除标记为天空
            var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
            camera.addComponent(CameraMoveScript);
            //设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
            camera.clearFlag = CameraClearFlags.Sky;

            //初始化平行光
            let directlightSprite = new Sprite3D();
            let dircom = directlightSprite.addComponent(DirectionLightCom);
            scene.addChild(directlightSprite);
            //设置平行光的方向
            var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
            mat.setForward(new Vector3(1, -1, 0));
            directlightSprite.transform.worldMatrix = mat;

            camera.transform.rotationEuler = new Vector3(34.9, 107.24, 0);
            camera.transform.position = new Vector3(4.92, -0.74, -3.6);
            // 预加载使用的图片资源
            Laya.loader.load(["res/threeDimen/skinModel/dude/dude.lh", "res/lensFlare/1.png", "res/lensFlare/2.png", "res/lensFlare/3.png", "res/lensFlare/7.png", "res/lensFlare/8.png", "res/lensFlare/9.png"], Handler.create(this, () => {
                //添加人物
                var dude: Sprite3D = (<Sprite3D>scene.addChild(Loader.createNodes("res/threeDimen/skinModel/dude/dude.lh")));
                dude.transform.rotate(new Vector3(0, 3.14, 0));

                let tex1 = Laya.loader.getRes("res/lensFlare/1.png") as Texture2D;
                let tex2 = Laya.loader.getRes("res/lensFlare/2.png") as Texture2D;
                let tex3 = Laya.loader.getRes("res/lensFlare/3.png") as Texture2D;
                let tex7 = Laya.loader.getRes("res/lensFlare/7.png") as Texture2D;
                let tex8 = Laya.loader.getRes("res/lensFlare/8.png") as Texture2D;
                let tex9 = Laya.loader.getRes("res/lensFlare/9.png") as Texture2D;

                let postprocess = camera.postProcess = new PostProcess();
                let lensFlare = new LensFlareEffect();
                postprocess.addEffect(lensFlare);
                lensFlare.bindLight = directlightSprite.getComponent(DirectionLightCom);

                let lensElement = new LensFlareElement();
                lensElement.texture = tex1;
                lensElement.startPosition = 0.0;
                lensElement.angularOffset = 0.0;
                lensElement.rotation = 0.0;
                lensElement.scale = new Vector2(24.8, 24.8);
                lensElement.positionOffset = new Vector2(0, 0);
                lensElement.intensity = 1.4;

                let lensElement2 = new LensFlareElement();
                lensElement2.texture = tex2;
                lensElement2.startPosition = 0.5;
                lensElement2.angularOffset = 0;
                lensElement2.rotation = 27.3;
                lensElement2.autoRotate = true;
                lensElement2.scale = new Vector2(22.3, 22.3);
                lensElement2.positionOffset = new Vector2(0, 0);
                lensElement2.intensity = 2.39;

                let lensElement7 = new LensFlareElement();
                lensElement7.texture = tex7;
                lensElement7.startPosition = 0.69;
                lensElement7.angularOffset = 0.0;
                lensElement7.rotation = 0.0;
                lensElement7.positionOffset = new Vector2(0, 0);
                lensElement7.scale = new Vector2(2.73, 2.73);
                lensElement7.intensity = 0.76;

                let lensElement7_1 = new LensFlareElement();
                lensElement7_1.texture = tex7;
                lensElement7_1.startPosition = 0.85;
                lensElement7_1.angularOffset = 0.0;
                lensElement7_1.positionOffset = new Vector2(0, 0);
                lensElement7_1.rotation = 0;
                lensElement7_1.scale = new Vector2(2.73, 2.73);
                lensElement7_1.scale = new Vector2(1.9, 1.9);
                lensElement7_1.intensity = 0.59;

                let lensElement3 = new LensFlareElement();
                lensElement3.texture = tex3;
                lensElement3.startPosition = 1.04;
                lensElement3.angularOffset = 0.0;
                lensElement3.positionOffset = new Vector2(0, 0);
                lensElement3.rotation = 107.4;
                lensElement3.autoRotate = true;
                lensElement3.scale = new Vector2(7.5, 7.5);
                lensElement3.intensity = 0.85;

                let lensElement9 = new LensFlareElement();
                lensElement9.texture = tex9;
                lensElement9.angularOffset = 0.0;
                lensElement9.startPosition = 0.76;
                lensElement9.rotation = 0;
                lensElement9.positionOffset = new Vector2(0, 0);
                lensElement9.scale = new Vector2(2.71, 2.71);
                lensElement9.intensity = 0.35;

                let lensElement8 = new LensFlareElement();
                lensElement8.texture = tex8;
                lensElement8.angularOffset = 0.0;
                lensElement8.startPosition = 0.31;
                lensElement8.positionOffset = new Vector2(0, 0);
                lensElement8.rotation = 0;
                lensElement8.scale = new Vector2(2.35, 2.35);
                lensElement8.intensity = 0.44;

                let lensData = new LensFlareData();
                lensData.elements.push(lensElement);
                lensData.elements.push(lensElement2);
                lensData.elements.push(lensElement7);
                lensData.elements.push(lensElement7_1);
                lensData.elements.push(lensElement3);
                lensData.elements.push(lensElement9);
                lensData.elements.push(lensElement8);

                lensFlare.lensFlareData = lensData;
                lensFlare.effectIntensity = 0.4;
                lensFlare.effectScale = 1.0;
            }));


        });
    }
}

