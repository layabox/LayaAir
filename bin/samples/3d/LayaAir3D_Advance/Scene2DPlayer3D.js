import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class Scene2DPlayer3D {
    constructor() {
        /**
         * (pos.x pos.y) 屏幕位置
         *  pos.z 深度取值范围(-1,1);
         * */
        this._pos = new Vector3(310, 500, 0);
        this._translate = new Vector3(0, 0, 0);
        this._translate2 = new Vector3(5, -10, 1);
        this._translate3 = new Vector3(0, 0, -0.2);
        this._translate4 = new Vector3(0, 0, 0.2);
        this._translate5 = new Vector3(-0.2, 0, 0);
        this._translate6 = new Vector3(0.2, 0, 0);
        this._rotation = new Vector3(-45, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //var dialog:Image = Laya.stage.addChild(new Image("res/threeDimen/secne.jpg")) as Image;
        var dialog = new Image("res/threeDimen/secne.jpg");
        Laya.stage.addChild(dialog);
        var scene = Laya.stage.addChild(new Scene3D());
        var camera = scene.addChild(new Camera(0, 0.1, 1000));
        camera.transform.rotate(this._rotation, false, false);
        camera.transform.translate(this._translate2);
        camera.orthographic = true;
        camera.clearFlag = BaseCamera.CLEARFLAG_DEPTHONLY;
        //正交投影垂直矩阵尺寸
        camera.orthographicVerticalSize = 10;
        var directionLight = scene.addChild(new DirectionLight());
        Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey) {
            scene.addChild(layaMonkey);
            this._layaMonkey = layaMonkey;
            var tmpLocalScale = layaMonkey.transform.localScale;
            tmpLocalScale.setValue(0.3, 0.3, 0.3);
            //转换2D屏幕坐标系统到3D正交投影下的坐标系统
            camera.convertScreenCoordToOrthographicCoord(this._pos, this._translate);
            layaMonkey.transform.position = this._translate;
            var tmpRotationEuler = layaMonkey.transform.rotationEuler;
            tmpRotationEuler.setValue(-30, 0, 0);
            Laya.timer.frameLoop(1, this, this.onKeyDown);
        }));
    }
    onKeyDown() {
        KeyBoardManager.hasKeyDown(87) && this._layaMonkey.transform.translate(this._translate3); //W
        KeyBoardManager.hasKeyDown(83) && this._layaMonkey.transform.translate(this._translate4); //S
        KeyBoardManager.hasKeyDown(65) && this._layaMonkey.transform.translate(this._translate5); //A
        KeyBoardManager.hasKeyDown(68) && this._layaMonkey.transform.translate(this._translate6); //D
    }
}
