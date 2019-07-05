import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator";
import { AnimatorState } from "laya/d3/component/AnimatorState";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
/**
 * ...
 * @author ...
 */
export class BoneLinkSprite3D {
    constructor() {
        this._dragonScale = new Vector3(1.5, 1.5, 1.5);
        this._rotation = new Quaternion(-0.5, -0.5, 0.5, -0.5);
        this._position = new Vector3(-0.2, 0.0, 0.0);
        this._scale = new Vector3(0.75, 0.75, 0.75);
        this._translate = new Vector3(0, 3, 5);
        this._rotation2 = new Vector3(-15, 0, 0);
        this._forward = new Vector3(-1.0, -1.0, -1.0);
        this.curStateIndex = 0;
        //初始化引擎
        Laya3D.init(0, 0);
        //适配模式
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //开启统计信息
        Stat.show();
        //预加载所有资源
        var resource = ["res/threeDimen/skinModel/BoneLinkScene/R_kl_H_001.lh",
            "res/threeDimen/skinModel/BoneLinkScene/R_kl_S_009.lh",
            "res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"];
        Laya.loader.create(resource, Handler.create(this, this.onLoadFinish));
    }
    onLoadFinish() {
        //初始化场景
        this.scene = Laya.stage.addChild(new Scene3D());
        this.scene.ambientColor.setValue(0.5, 0.5, 0.5);
        //初始化相机
        var camera = this.scene.addChild(new Camera(0, 0.1, 100));
        camera.transform.translate(this._translate);
        camera.transform.rotate(this._rotation2, true, false);
        camera.addComponent(CameraMoveScript);
        var directionLight = this.scene.addChild(new DirectionLight());
        //设置平行光的方向
        var mat = directionLight.transform.worldMatrix;
        mat.setForward(this._forward);
        directionLight.transform.worldMatrix = mat;
        //初始化角色精灵
        this.role = this.scene.addChild(new Sprite3D());
        //初始化胖子
        this.pangzi = this.role.addChild(Loader.getRes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"));
        //获取动画组件
        this.animator = this.pangzi.getChildAt(0).getComponent(Animator);
        //创建动作状态
        var state1 = new AnimatorState();
        //动作名称
        state1.name = "hello";
        //动作播放起始时间
        state1.clipStart = 296 / 581;
        //动作播放结束时间
        state1.clipEnd = 346 / 581;
        //设置动作
        state1.clip = this.animator.getDefaultState().clip;
        //设置动作循环
        state1.clip.islooping = true;
        //为动画组件添加一个动作状态
        this.animator.addState(state1);
        //播放动作
        this.animator.play("hello");
        var state2 = new AnimatorState();
        state2.name = "ride";
        state2.clipStart = 3 / 581;
        state2.clipEnd = 33 / 581;
        state2.clip = this.animator.getDefaultState().clip;
        state2.clip.islooping = true;
        this.animator.addState(state2);
        this.dragon1 = Loader.getRes("res/threeDimen/skinModel/BoneLinkScene/R_kl_H_001.lh");
        this.dragon1.transform.localScale = this._dragonScale;
        this.aniSprte3D1 = this.dragon1.getChildAt(0);
        this.dragonAnimator1 = this.aniSprte3D1.getComponent(Animator);
        var state3 = new AnimatorState();
        state3.name = "run";
        state3.clipStart = 50 / 644;
        state3.clipEnd = 65 / 644;
        state3.clip = this.dragonAnimator1.getDefaultState().clip;
        state3.clip.islooping = true;
        this.dragonAnimator1.addState(state3);
        this.dragon2 = Loader.getRes("res/threeDimen/skinModel/BoneLinkScene/R_kl_S_009.lh");
        this.dragon2.transform.localScale = this._dragonScale;
        this.aniSprte3D2 = this.dragon2.getChildAt(0);
        this.dragonAnimator2 = this.aniSprte3D2.getComponent(Animator);
        var state4 = new AnimatorState();
        state4.name = "run";
        state4.clipStart = 50 / 550;
        state4.clipEnd = 65 / 550;
        state4.clip = this.dragonAnimator2.getDefaultState().clip;
        state4.clip.islooping = true;
        this.dragonAnimator2.addState(state4);
        this.loadUI();
    }
    loadUI() {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "乘骑坐骑"));
            this.changeActionButton.size(160, 40);
            this.changeActionButton.labelBold = true;
            this.changeActionButton.labelSize = 30;
            this.changeActionButton.sizeGrid = "4,4,4,4";
            this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
            this.changeActionButton.on(Event.CLICK, this, function () {
                this.curStateIndex++;
                if (this.curStateIndex % 3 == 1) {
                    this.changeActionButton.label = "切换坐骑";
                    this.scene.addChild(this.dragon1);
                    this.aniSprte3D1.addChild(this.role);
                    //关联精灵节点到Avatar节点
                    this.dragonAnimator1.linkSprite3DToAvatarNode("point", this.role);
                    this.animator.play("ride");
                    this.dragonAnimator1.play("run");
                    this.pangzi.transform.localRotation = this._rotation;
                    this.pangzi.transform.localPosition = this._position;
                    this.pangzi.transform.localScale = this._scale;
                }
                else if (this.curStateIndex % 3 == 2) {
                    this.changeActionButton.label = "卸下坐骑";
                    //骨骼取消关联节点
                    this.dragonAnimator1.unLinkSprite3DToAvatarNode(this.role);
                    this.aniSprte3D1.removeChild(this.role);
                    this.dragon1.removeSelf();
                    this.scene.addChild(this.dragon2);
                    this.aniSprte3D2.addChild(this.role);
                    //骨骼关联节点
                    this.dragonAnimator2.linkSprite3DToAvatarNode("point", this.role);
                    this.animator.play("ride");
                    this.dragonAnimator2.play("run");
                    this.pangzi.transform.localRotation = this._rotation;
                    this.pangzi.transform.localPosition = this._position;
                    this.pangzi.transform.localScale = this._scale;
                }
                else {
                    this.changeActionButton.label = "乘骑坐骑";
                    //骨骼取消关联节点
                    this.dragonAnimator2.unLinkSprite3DToAvatarNode(this.role);
                    this.aniSprte3D2.removeChild(this.role);
                    this.dragon2.removeSelf();
                    this.scene.addChild(this.role);
                    this.animator.play("hello");
                }
            });
        }));
    }
}
