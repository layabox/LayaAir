import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Handler } from "laya/utils/Handler";
/**
 * ...
 * @author ...
 */
export class StaticBatchingTest {
    constructor() {
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //预加载资源,该资源在Unity中已勾选Static后导出
        Laya.loader.create(["res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls"], Handler.create(this, this.onComplete));
    }
    onComplete() {
        //加载场景
        var scene = Laya.stage.addChild(Loader.getRes("res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls"));
        //添加相机
        var camera = scene.getChildByName("Main Camera");
        //相机添加视角控制组件(脚本)
        camera.addComponent(CameraMoveScript);
    }
}
