import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author
 */
export class SkinAnimationSample {
    constructor() {
        this.curStateIndex = 0;
        this.clipName = ["idle", "fallingback", "idle", "walk", "Take 001"];
        this._translate = new Vector3(0, 1.5, 4);
        this._rotation = new Vector3(-15, 0, 0);
        this._forward = new Vector3(-1.0, -1.0, -1.0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        var scene = Laya.stage.addChild(new Scene3D());
        var camera = (scene.addChild(new Camera(0, 0.1, 1000)));
        camera.transform.translate(this._translate);
        camera.transform.rotate(this._rotation, true, false);
        camera.addComponent(CameraMoveScript);
        var directionLight = scene.addChild(new DirectionLight());
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(this._forward);
        directionLight.transform.worldMatrix = mat;
        directionLight.color.setValue(1, 1, 1);
        Sprite3D.load("res/threeDimen/skinModel/Zombie/Plane.lh", Handler.create(this, function (plane) {
            scene.addChild(plane);
        }));
        Sprite3D.load("res/threeDimen/skinModel/Zombie/Zombie.lh", Handler.create(this, function (zombie) {
            scene.addChild(zombie);
            this.zombieAnimator = zombie.getChildAt(0).getComponent(Animator); //获取Animator动画组件
            this.loadUI();
        }));
    }
    loadUI() {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作"));
            this.changeActionButton.size(160, 40);
            this.changeActionButton.labelBold = true;
            this.changeActionButton.labelSize = 30;
            this.changeActionButton.sizeGrid = "4,4,4,4";
            this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
            this.changeActionButton.on(Event.CLICK, this, function () {
                //根据名称播放动画
                this.zombieAnimator.play(this.clipName[++this.curStateIndex % this.clipName.length]);
            });
        }));
    }
}
