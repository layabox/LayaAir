import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Browser } from "laya/utils/Browser";
export class AnimationTest {
    constructor() {
        Laya3D.init(0, 0);
        Stat.show();
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        if (Browser.onAndroid) {
            Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/Android/layaScene.ls", Handler.create(null, function (scene) {
                Laya.stage.addChild(scene);
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
            }));
        }
        else if (Browser.onIOS) {
            Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/IOS/layaScene.ls", Handler.create(null, function (scene) {
                Laya.stage.addChild(scene);
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
            }));
        }
        else {
            Scene3D.load("../../../../res/threeDimen/scene/LayaScene_DUDEcompress/Conventional/layaScene.ls", Handler.create(null, function (scene) {
                Laya.stage.addChild(scene);
                var camera = scene.getChildByName("Main Camera");
                camera.addComponent(CameraMoveScript);
            }));
        }
    }
}
