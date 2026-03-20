import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Script } from "laya/components/Script";
import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "../../Main";

/**
 * 融合移动脚本
 * 控制整个 fusionGroup 做正弦曲线移动
 */
class FusionMoveScript extends Script {
    private _time: number = 0;
    private _startX: number = 0;
    private _startY: number = 0;
    private _rangeX: number = 200;
    private _rangeY: number = 80;

    onStart(): void {
        const owner = this.owner as Sprite;
        this._startX = owner.x;
        this._startY = owner.y;
    }

    onUpdate(): void {
        this._time += 0.02;
        const owner = this.owner as Sprite;
        owner.x = this._startX + Math.sin(this._time) * this._rangeX;
        owner.y = this._startY + Math.sin(this._time * 0.7) * this._rangeY;
    }
}

/**
 * Bridge3D动画角色Demo
 * 将PangZi角色嵌入Bridge3D，上下放置2D元素，整体融合移动
 */
export class Bridge3DAnimator {
    private _animator: Animator;
    private _curStateIndex: number = 0;
    private _curActionName: string = null;
    private _progressText: Text;
    private _stateText: Text;
    private _playBtn: Button;

    private _stateNames: string[] = ["hello", "ride", "动作状态三", "动作状态四", "动作状态五", "动作状态六"];

    constructor(maincls: typeof Main) {
        Laya.loader.load(
            ["res/threeDimen/skinModel/BoneLinkScene/PangZi.lh", "res/threeDimen/ui/button.png"],
            Handler.create(this, () => { this.onLoaded(maincls); })
        );
    }

    private onLoaded(maincls: typeof Main): void {

        Laya.stage.bgColor = "#232628";
        // 创建2D场景
        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        // fusionGroup - 父容器，包含所有融合元素
        const fusionGroup = new Sprite();
        fusionGroup.pos(Laya.stage.width / 2 - 150, Laya.stage.height / 2 - 220);
        scene2D.addChild(fusionGroup);

        // === 上方2D：彩色矩形 + 标题 ===
        const topPanel = new Sprite();
        topPanel.graphics.drawRect(0, 0, 300, 40, "#3366cc");
        topPanel.pos(0, 0);
        fusionGroup.addChild(topPanel);

        const titleText = new Text();
        titleText.text = "Bridge3D 动画角色";
        titleText.color = "#ffffff";
        titleText.fontSize = 20;
        titleText.bold = true;
        titleText.pos(60, 8);
        fusionGroup.addChild(titleText);

        // === 中间3D：Bridge3DSprite ===
        const bridge = new Bridge3DSprite();
        bridge.scale3DToPixel = 100;
        bridge.pos(150, 200);
        fusionGroup.addChild(bridge);

        const holder = scene2D.bridge3D;
        holder.scene3d.ambientColor = new Color(0.5, 0.5, 0.5, 1);
        holder.cameraZDistance = 300;

        // 方向光
        const lightSprite = new Sprite3D();
        const dirCom = lightSprite.addComponent(DirectionLightCom);
        dirCom.color = new Color(1, 1, 1, 1);
        bridge.addChild(lightSprite);
        const mat: Matrix4x4 = lightSprite.transform.worldMatrix;
        mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        lightSprite.transform.worldMatrix = mat;

        // PangZi模型
        const pangzi = Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh") as Sprite3D;
        pangzi.transform.localRotationEuler = new Vector3(0, 0, 0);
        bridge.addChild(pangzi);

        // 获取动画组件并创建动作状态
        this._animator = pangzi.getChildAt(0).getComponent(Animator) as Animator;
        this.setupAnimatorStates();

        // === 下方2D：彩色矩形 + 状态/进度文本 ===
        const bottomPanel = new Sprite();
        bottomPanel.graphics.drawRect(0, 0, 300, 60, "#336633");
        bottomPanel.pos(0, 360);
        fusionGroup.addChild(bottomPanel);

        this._stateText = new Text();
        this._stateText.text = "状态: 等待播放";
        this._stateText.color = "#ffffff";
        this._stateText.fontSize = 16;
        this._stateText.pos(10, 365);
        fusionGroup.addChild(this._stateText);

        this._progressText = new Text();
        this._progressText.text = "进度: 0.00";
        this._progressText.color = "#ccffcc";
        this._progressText.fontSize = 16;
        this._progressText.pos(10, 390);
        fusionGroup.addChild(this._progressText);

        // 添加融合移动脚本
        fusionGroup.addComponent(FusionMoveScript);

        // === 控制按钮（固定在scene2D上，不随fusionGroup移动）===
        this._playBtn = new Button("res/threeDimen/ui/button.png", "播放动画");
        this._playBtn.size(160, 40);
        this._playBtn.labelBold = true;
        this._playBtn.labelSize = 24;
        this._playBtn.sizeGrid = "4,4,4,4";
        this._playBtn.scale(Browser.pixelRatio, Browser.pixelRatio);
        this._playBtn.pos(20, 300);
        scene2D.addChild(this._playBtn);
        this._playBtn.on(Event.CLICK, this, this.onPlayPause);

        const switchBtn = new Button("res/threeDimen/ui/button.png", "切换动作");
        switchBtn.size(160, 40);
        switchBtn.labelBold = true;
        switchBtn.labelSize = 24;
        switchBtn.sizeGrid = "4,4,4,4";
        switchBtn.scale(Browser.pixelRatio, Browser.pixelRatio);
        switchBtn.pos(200, 300);
        scene2D.addChild(switchBtn);
        switchBtn.on(Event.CLICK, this, this.onSwitchAction);

        // 帧循环更新进度
        Laya.timer.frameLoop(1, this, this.onFrame);
    }

    private setupAnimatorStates(): void {
        const clip = this._animator.getDefaultState().clip;
        clip.islooping = true;
        const layer = this._animator.getControllerLayer(0);

        const stateConfigs = [
            { name: "hello", start: 296 / 581, end: 346 / 581 },
            { name: "ride", start: 0 / 581, end: 33 / 581 },
            { name: "动作状态三", start: 34 / 581, end: 100 / 581 },
            { name: "动作状态四", start: 101 / 581, end: 200 / 581 },
            { name: "动作状态五", start: 201 / 581, end: 295 / 581 },
            { name: "动作状态六", start: 345 / 581, end: 581 / 581 },
        ];

        for (const cfg of stateConfigs) {
            const state = new AnimatorState();
            state.name = cfg.name;
            state.clipStart = cfg.start;
            state.clipEnd = cfg.end;
            state.clip = clip;
            layer.addState(state);
        }

        this._animator.speed = 0.0;
    }

    private onPlayPause(): void {
        if (this._playBtn.label === "暂停动画") {
            this._playBtn.label = "播放动画";
            this._animator.speed = 0.0;
        } else {
            this._playBtn.label = "暂停动画";
            if (this._curActionName) {
                this._animator.play(this._curActionName);
            } else {
                this._curActionName = this._stateNames[0];
                this._animator.play(this._curActionName);
            }
            this._animator.speed = 1.0;
        }
    }

    private onSwitchAction(): void {
        this._curStateIndex = (this._curStateIndex + 1) % this._stateNames.length;
        this._curActionName = this._stateNames[this._curStateIndex];
        this._animator.speed = 0.0;
        this._animator.play(this._curActionName);
        this._animator.speed = 1.0;
        this._playBtn.label = "暂停动画";
        this._stateText.text = "状态: " + this._curActionName;
    }

    private onFrame(): void {
        if (this._animator && this._animator.speed > 0.0) {
            const playState = this._animator.getCurrentAnimatorPlayState(0);
            if (playState) {
                this._progressText.text = "进度: " + playState.normalizedTime.toFixed(2);
            }
        }
    }
}
