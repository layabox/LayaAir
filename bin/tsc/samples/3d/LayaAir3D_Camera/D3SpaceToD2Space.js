import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
export class D3SpaceToD2Space {
    constructor() {
        this._position = new Vector3();
        this._outPos = new Vector3();
        this.scaleDelta = 0;
        this._translate = new Vector3(0, 0.35, 1);
        this._rotation = new Vector3(-15, 0, 0);
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //创建场景
        this.scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(this._translate);
        this.camera.transform.rotate(this._rotation, true, false);
        //创建平行光
        var directionLight = this.scene.addChild(new DirectionLight());
        var completeHandler = Handler.create(this, this.onComplete);
        Laya.loader.create("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", completeHandler);
    }
    onComplete() {
        var _this = this;
        //加载精灵
        Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey3D) {
            _this.layaMonkey3D = layaMonkey3D;
            this.scene.addChild(layaMonkey3D);
            this.layaMonkey2D = Laya.stage.addChild(new Image("res/threeDimen/monkey.png"));
            //开启时钟事件
            Laya.timer.frameLoop(1, _this, this.animate);
        }));
    }
    animate() {
        this._position.x = Math.sin(this.scaleDelta += 0.01);
        //变换的精灵的位置
        this.layaMonkey3D.transform.position = this._position;
        //矩阵变换得到对应的屏幕坐标
        this.camera.viewport.project(this.layaMonkey3D.transform.position, this.camera.projectionViewMatrix, this._outPos);
        this.layaMonkey2D.pos(this._outPos.x / Laya.stage.clientScaleX, this._outPos.y / Laya.stage.clientScaleY);
    }
}
