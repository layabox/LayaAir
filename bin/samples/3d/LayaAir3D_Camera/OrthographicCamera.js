import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { BaseCamera } from "laya/d3/core/BaseCamera";
export class OrthographicCamera {
    constructor() {
        /**
         * (pos.x pos.y) 屏幕位置
         *  pos.z 深度取值范围(-1,1);
         * */
        this.pos = new Vector3(310, 500, 0);
        this._translate = new Vector3(0, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        ;
        Stat.show();
        var dialog = Laya.stage.addChild(new Image("res/cartoon2/background.jpg"));
        var scene = Laya.stage.addChild(new Scene3D());
        var camera = scene.addChild(new Camera(0, 0.1, 1000));
        camera.transform.rotate(new Vector3(-45, 0, 0), false, false);
        camera.transform.translate(new Vector3(5, -10, 1));
        camera.orthographic = true;
        camera.clearFlag = BaseCamera.CLEARFLAG_DEPTHONLY;
        //正交投影垂直矩阵尺寸
        camera.orthographicVerticalSize = 10;
        var directionLight = scene.addChild(new DirectionLight());
        Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey) {
            scene.addChild(layaMonkey);
            layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
            //转换2D屏幕坐标系统到3D正交投影下的坐标系统
            camera.convertScreenCoordToOrthographicCoord(this.pos, this._translate);
            layaMonkey.transform.position = this._translate;
            Laya.stage.on(Event.RESIZE, this, function () {
                camera.convertScreenCoordToOrthographicCoord(this.pos, this._translate);
                layaMonkey.transform.position = this._translate;
            });
        }));
    }
}
