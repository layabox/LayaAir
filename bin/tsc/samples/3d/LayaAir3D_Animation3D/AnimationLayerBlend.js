import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
export class AnimationLayerBlend {
    constructor() {
        this._motionCross = false;
        this._blendType = 0;
        this._motionIndex = 0;
        this._motions = ["run", "run_2", "attack", "attack_1", "attack_2", "dead", "idle_2", "idle_3", "idle_4", "idle4", "reload", "replace", "replace_2", "stop"];
        //初始化引擎
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //显示性能面板
        Stat.show();
        //加载场景资源
        Scene3D.load("res/threeDimen/scene/LayaScene_Sniper/Sniper.ls", Handler.create(this, this.sceneLoaded));
    }
    sceneLoaded(scene) {
        Laya.stage.addChild(scene);
        //获取精灵的动画组件
        var animator = scene.getChildAt(2).getComponent(Animator);
        this.addButton(100, 100, 160, 30, "动画过渡:否", 20, function (e) {
            this._motionCross = !this._motionCross;
            if (this._motionCross)
                e.target.label = "动画过渡:是";
            else
                e.target.label = "动画过渡:否";
        });
        this.addButton(100, 160, 160, 30, "混合模式:全身", 20, function (e) {
            this._blendType++;
            (this._blendType === 3) && (this._blendType = 0);
            switch (this._blendType) {
                case 0:
                    e.target.label = "混合模式:全身";
                    break;
                case 1:
                    e.target.label = "混合模式:上身";
                    break;
                case 2:
                    e.target.label = "混合模式:下身";
                    break;
            }
        });
        this.addButton(100, 220, 260, 40, "切换动作:attack_2", 28, function (e) {
            switch (this._blendType) {
                case 0:
                    if (this._motionCross) {
                        //在当前动画状态和目标动画状态之间进行融合过渡播放
                        //第三个参数为layerIndex 层索引使用混合模式，混合了0层和1层的动画
                        animator.crossFade(this._motions[this._motionIndex], 0.2, 0);
                        animator.crossFade(this._motions[this._motionIndex], 0.2, 1);
                    }
                    else {
                        //使用普通模式播放
                        animator.play(this._motions[this._motionIndex], 0);
                        animator.play(this._motions[this._motionIndex], 1);
                    }
                    break;
                case 1:
                    if (this._motionCross)
                        //在当前动画状态和目标动画状态之间进行融合过渡播放
                        //第三个参数为layerIndex 层索引，没有使用混合模式，仅仅是使用0层的动画
                        animator.crossFade(this._motions[this._motionIndex], 0.2, 0);
                    else
                        animator.play(this._motions[this._motionIndex], 0);
                    break;
                case 2:
                    if (this._motionCross)
                        //在当前动画状态和目标动画状态之间进行融合过渡播放
                        //第三个参数为layerIndex 层索引，没有使用混合模式，仅仅是使用1层的动画
                        animator.crossFade(this._motions[this._motionIndex], 0.2, 1);
                    else
                        animator.play(this._motions[this._motionIndex], 1);
                    break;
            }
            e.target.label = "切换动作:" + this._motions[this._motionIndex];
            this._motionIndex++;
            (this._motionIndex === this._motions.length) && (this._motionIndex = 0);
        });
    }
    addButton(x, y, width, height, text, size, clickFun) {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            var changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", text));
            changeActionButton.size(width, height);
            changeActionButton.labelBold = true;
            changeActionButton.labelSize = size;
            changeActionButton.sizeGrid = "4,4,4,4";
            changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            changeActionButton.pos(x, y);
            changeActionButton.on(Event.CLICK, this, clickFun);
        }));
    }
}
