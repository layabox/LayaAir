import { Laya } from "Laya";
import { Bridge3DSprite } from "laya/bridge/Bridge3DSprite";
import { Script } from "laya/components/Script";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene } from "laya/display/Scene";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Color } from "laya/maths/Color";
import { Handler } from "laya/utils/Handler";
import { Main } from "../../Main";

/**
 * 粒子融合移动脚本
 * 使用Lissajous曲线移动（与动画demo区分）
 */
class ParticleFusionMoveScript extends Script {
    private _time: number = 0;
    private _startX: number = 0;
    private _startY: number = 0;
    private _rangeX: number = 180;
    private _rangeY: number = 100;

    onStart(): void {
        const owner = this.owner as Sprite;
        this._startX = owner.x;
        this._startY = owner.y;
    }

    onUpdate(): void {
        this._time += 0.015;
        const owner = this.owner as Sprite;
        // Lissajous曲线: x = A*sin(a*t+d), y = B*sin(b*t)
        owner.x = this._startX + Math.sin(this._time * 3 + Math.PI / 4) * this._rangeX;
        owner.y = this._startY + Math.sin(this._time * 2) * this._rangeY;
    }
}

/**
 * Bridge3D粒子特效Demo
 * 将燃烧地面粒子嵌入Bridge3D，上下放置2D元素，整体融合移动
 */
export class Bridge3DParticle {
    constructor(maincls: typeof Main) {
        this.onLoaded(maincls);
    }

    private onLoaded(maincls: typeof Main): void {
        // 创建2D场景
        const scene2D = new Scene();
        maincls.box2D.addChild(scene2D);

        Laya.stage.bgColor = "#232628";
        // fusionGroup - 父容器
        const fusionGroup = new Sprite();
        fusionGroup.pos(Laya.stage.width / 2 - 150, Laya.stage.height / 2 - 200);
        scene2D.addChild(fusionGroup);

        // === 上方2D：暖色矩形 + 标题 ===
        const topPanel = new Sprite();
        topPanel.graphics.drawRect(0, 0, 300, 40, "#cc6633");
        topPanel.pos(0, 0);
        fusionGroup.addChild(topPanel);

        const titleText = new Text();
        titleText.text = "Bridge3D 粒子特效";
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
        holder.scene3d.ambientColor = new Color(0.6, 0.6, 0.6, 1);
        holder.cameraZDistance = 300;

        // 异步加载粒子
        Sprite3D.load("res/threeDimen/particle/lv_kuosan.lh", Handler.create(this, function (sprite: Sprite3D): void {
            bridge.addChild(sprite);
            let localPos = sprite.transform.localPosition;
            localPos.x = 0;
            localPos.y = 0;
            localPos.z = 0;
            sprite.transform.localPosition = localPos;
        }));

        // === 下方2D：冷色矩形 + 描述文本 ===
        const bottomPanel = new Sprite();
        bottomPanel.graphics.drawRect(0, 0, 300, 50, "#335577");
        bottomPanel.pos(0, 350);
        fusionGroup.addChild(bottomPanel);

        const descText = new Text();
        descText.text = "燃烧地面粒子效果";
        descText.color = "#aaddff";
        descText.fontSize = 16;
        descText.pos(70, 355);
        fusionGroup.addChild(descText);

        const infoText = new Text();
        infoText.text = "Lissajous 曲线融合移动";
        infoText.color = "#88bbdd";
        infoText.fontSize = 14;
        infoText.pos(55, 378);
        fusionGroup.addChild(infoText);

        // 添加Lissajous曲线移动脚本
        fusionGroup.addComponent(ParticleFusionMoveScript);
    }
}
