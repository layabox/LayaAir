import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Texture2D } from "laya/resource/Texture2D";
/**
 * ...
 * @author
 */
export class BlinnPhong_SpecularMap {
    constructor() {
        this.rotation = new Vector3(0, 0.01, 0);
        this.specularMapUrl = ["res/threeDimen/skinModel/dude/Assets/dude/headS.png", "res/threeDimen/skinModel/dude/Assets/dude/jacketS.png", "res/threeDimen/skinModel/dude/Assets/dude/pantsS.png", "res/threeDimen/skinModel/dude/Assets/dude/upBodyS.png", "res/threeDimen/skinModel/dude/Assets/dude/upBodyS.png"];
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.scene = Laya.stage.addChild(new Scene3D());
        var camera = (this.scene.addChild(new Camera(0, 0.1, 1000)));
        camera.transform.translate(new Vector3(0, 3, 5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color.setValue(1, 1, 1);
        Laya.loader.create("res/threeDimen/skinModel/dude/dude.lh", Handler.create(this, this.onComplete));
    }
    onComplete() {
        Sprite3D.load("res/threeDimen/skinModel/dude/dude.lh", Handler.create(this, function (sprite) {
            var dude1 = this.scene.addChild(sprite);
            dude1.transform.position = new Vector3(-1.5, 0, 0);
            var dude2 = Sprite3D.instantiate(dude1, this.scene, false, new Vector3(1.5, 0, 0));
            var skinnedMeshSprite3d = dude2.getChildAt(0).getChildAt(0);
            for (var i = 0; i < skinnedMeshSprite3d.skinnedMeshRenderer.materials.length; i++) {
                var material = skinnedMeshSprite3d.skinnedMeshRenderer.materials[i];
                Texture2D.load(this.specularMapUrl[i], Handler.create(this, function (mat, tex) {
                    mat.specularTexture = tex; //高光贴图
                }, [material]));
            }
            Laya.timer.frameLoop(1, this, function () {
                dude1.transform.rotate(this.rotation);
                dude2.transform.rotate(this.rotation);
            });
        }));
    }
}
