import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class PBRDemo {
    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        Scene3D.load("res/threeDimen/scene/PBRScene/Demo.ls", Handler.create(null, function (scene) {
            Laya.stage.addChild(scene);
            var camera = scene.getChildByName("Camera");
            camera.addComponent(CameraMoveScript);
        }));
    }
}
