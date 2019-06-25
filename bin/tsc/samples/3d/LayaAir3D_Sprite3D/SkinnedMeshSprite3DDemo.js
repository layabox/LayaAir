import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
export class SkinnedMeshSprite3DDemo {
    constructor() {
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this.scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        var camera = this.scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(new Vector3(0, 0.5, 1));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        //添加光照
        var directionLight = this.scene.addChild(new DirectionLight());
        directionLight.color = new Vector3(1, 1, 1);
        directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));
        //预加载资源
        Laya.loader.create("res/threeDimen/skinModel/dude/dude.lh", Handler.create(this, this.onComplete));
    }
    onComplete() {
        //添加父级猴子
        var dude = this.scene.addChild(Loader.getRes("res/threeDimen/skinModel/dude/dude.lh"));
        //缩放
        var scale = new Vector3(0.1, 0.1, 0.1);
        dude.transform.localScale = scale;
        dude.transform.rotate(new Vector3(0, 3.14, 0));
    }
}
