import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class BlinnPhong_NormalMap {
    constructor() {
        this.rotation = new Vector3(0, 0.01, 0);
        this.normalMapUrl = ["res/threeDimen/staticModel/lizard/Assets/Lizard/lizardeye_norm.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/lizard_norm.png", "res/threeDimen/staticModel/lizard/Assets/Lizard/rock_norm.png"];
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        var camera = (this.scene.addChild(new Camera(0, 0.1, 100)));
        camera.transform.translate(new Vector3(0, 0.6, 1.1));
        camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        var directionLight = this.scene.addChild(new DirectionLight());
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(new Vector3(0.0, -0.8, -1.0));
        directionLight.transform.worldMatrix = mat;
        directionLight.color.setValue(1, 1, 1);
        Laya.loader.create("res/threeDimen/staticModel/lizard/lizard.lh", Handler.create(this, this.onComplete), null, Laya3D.HIERARCHY);
    }
    onComplete(s) {
        Sprite3D.load("res/threeDimen/staticModel/lizard/lizard.lh", Handler.create(this, function (sprite) {
            var monster1 = this.scene.addChild(sprite);
            monster1.transform.position = new Vector3(-0.6, 0, 0);
            monster1.transform.localScale = new Vector3(0.075, 0.075, 0.075);
            var monster2 = Sprite3D.instantiate(monster1, this.scene, false, new Vector3(0.6, 0, 0));
            monster2.transform.localScale = new Vector3(0.075, 0.075, 0.075);
            for (var i = 0; i < monster2.getChildByName("lizard").numChildren; i++) {
                var meshSprite3D = monster2.getChildByName("lizard").getChildAt(i);
                var material = meshSprite3D.meshRenderer.material;
                //法线贴图
                Texture2D.load(this.normalMapUrl[i], Handler.create(this, function (mat, texture) {
                    mat.normalTexture = texture;
                }, [material]));
            }
            Laya.timer.frameLoop(1, this, function () {
                monster1.transform.rotate(this.rotation);
                monster2.transform.rotate(this.rotation);
            });
        }));
    }
}
