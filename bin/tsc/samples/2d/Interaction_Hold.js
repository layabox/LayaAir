import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Ease } from "laya/utils/Ease";
import { Handler } from "laya/utils/Handler";
import { Tween } from "laya/utils/Tween";
import { WebGL } from "laya/webgl/WebGL";
export class Interaction_Hold {
    constructor(maincls) {
        this.HOLD_TRIGGER_TIME = 1000;
        this.apePath = "res/apes/monkey2.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //
        //			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        //			Laya.stage.alignH = Stage.ALIGN_CENTER;
        //
        //			Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.apePath, Handler.create(this, this.createApe));
    }
    createApe(_e = null) {
        // 添加一只猩猩
        this.ape = new Sprite();
        this.ape.loadImage(this.apePath);
        var texture = Laya.loader.getRes(this.apePath);
        this.ape.pivot(texture.width / 2, texture.height / 2);
        this.ape.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.ape.scale(0.8, 0.8);
        this.Main.box2D.addChild(this.ape);
        // 鼠标交互
        this.ape.on(Event.MOUSE_DOWN, this, this.onApePress);
    }
    onApePress(e = null) {
        // 鼠标按下后，HOLD_TRIGGER_TIME毫秒后hold
        Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold);
        Laya.stage.on(Event.MOUSE_UP, this, this.onApeRelease);
    }
    onHold(e = null) {
        Tween.to(this.ape, { "scaleX": 1, "scaleY": 1 }, 500, Ease.bounceOut);
        this.isApeHold = true;
    }
    /** 鼠标放开后停止hold */
    onApeRelease(e = null) {
        // 鼠标放开时，如果正在hold，则播放放开的效果
        if (this.isApeHold) {
            this.isApeHold = false;
            Tween.to(this.ape, { "scaleX": 0.8, "scaleY": 0.8 }, 300);
        }
        else // 如果未触发hold，终止触发hold
            Laya.timer.clear(this, this.onHold);
        Laya.stage.off(Event.MOUSE_UP, this, this.onApeRelease);
    }
    dispose() {
        if (this.ape) {
            this.ape.off(Event.MOUSE_DOWN, this, this.onApePress);
        }
        Laya.timer.clear(this, this.onHold);
        Laya.stage.off(Event.MOUSE_UP, this, this.onApeRelease);
    }
}
