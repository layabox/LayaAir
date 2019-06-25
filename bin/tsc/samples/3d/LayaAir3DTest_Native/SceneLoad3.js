import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Animator } from "laya/d3/component/Animator";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
export class SceneLoad3 {
    constructor() {
        this.monkeyRow = 10;
        this.monkeyCount = 0;
        Shader3D.debugMode = true;
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        var _this = this;
        Scene3D.load("../../../../res/threeDimen/scene/TerrainScene/XunLongShi.ls", Handler.create(null, function (scene) {
            _this._scene = scene;
            Laya.stage.addChild(scene);
            var camera = scene.getChildByName("Main Camera");
            camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
            camera.addComponent(CameraMoveScript);
            BaseMaterial.load("../../../../res/threeDimen/skyBox/skyBox3/skyBox3.lmat", Handler.create(null, function (mat) {
                //camera.skyboxMaterial = mat;
            }));
            scene.getChildByName('Scenes').getChildByName('HeightMap').active = false;
            scene.getChildByName('Scenes').getChildByName('Area').active = false;
            _this.loadMonkey();
        }));
    }
    loadMonkey() {
        //var camera:Camera = _scene.addChild(new Camera(0, 1, 100)) as Camera;
        //camera.transform.translate(new Vector3(0, 5, 7));
        //camera.transform.rotationEuler = new Vector3(-0.3, 0, 0);
        //camera.useOcclusionCulling = false;
        //camera.addComponent(CameraMoveScript);
        //camera.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        //camera.skyboxMaterial = SkyBoxMaterial.load("../../../../res/threeDimen/skybox/skyBox4/SkyboxMaterial.lmat");
        var _this = this;
        Sprite3D.load("../../../../res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(null, function (lm) {
            this.layaMonkey = lm;
            var meshSprite3d = lm.getChildAt(0).getChildByName("LayaMonkey");
            var mat = meshSprite3d.skinnedMeshRenderer.sharedMaterial;
            mat.albedoIntensity = 5;
            var monkeyAnimator = this.layaMonkey.getChildAt(0).getComponent(Animator);
            //monkeyAnimator.getDefaultClip().islooping = true;
            monkeyAnimator.getDefaultState(0)._clip.islooping = true;
            this.layaMonkey.transform.translate(new Vector3(0, 7, 0));
            this.layaMonkey.transform.scale = new Vector3(0.3, 0.3, 0.3);
            this.layaMonkey.transform.rotate(new Vector3(0, 180, 0), true, false);
            this._scene.addChild(this.layaMonkey);
            Laya.timer.frameOnce(1, _this, this.createMonkey);
        }));
    }
    createMonkey() {
        if (this.layaMonkey) {
            var i = parseInt((this.monkeyCount / this.monkeyRow).toString());
            var j = parseInt((this.monkeyCount % this.monkeyRow).toString());
            var sp = Sprite3D.instantiate(this.layaMonkey, this._scene, false, new Vector3((-this.monkeyRow / 2 + i) * 4, 7, -2 + -j * 2));
            //sp.transform.rotate(new Vector3(0, 180, 0),true,false );
            this.monkeyCount++;
            if (this.monkeyCount < this.monkeyRow * this.monkeyRow) {
                Laya.timer.frameOnce(1, this, this.createMonkey);
            }
        }
    }
}
