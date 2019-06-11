import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Vector4 } from "laya/d3/math/Vector4";
/**
 * ...
 * @author ...
 */
export class Particle_BurningGround {
    constructor() {
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //新建场景
        var scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        var camera = scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(new Vector3(0, 2, 4));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        camera.clearColor = new Vector4(0, 0, 0, 1);
        Sprite3D.load("res/threeDimen/particle/ETF_Burning_Ground.lh", Handler.create(this, function (sprite) {
            scene.addChild(sprite);
        }));
    }
}
