import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Keyboard } from "laya/events/Keyboard";
import { TimeLine } from "laya/utils/TimeLine";
export class Tween_TimeLine {
    constructor(maincls) {
        this.timeLine = new TimeLine();
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //			Laya.init(550, 400, WebGL);
        //			
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //			
        //			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.createApe();
        this.createTimerLine();
        Laya.stage.on(Event.KEY_DOWN, this, this.keyDown);
    }
    createApe() {
        this.target = new Sprite();
        this.target.loadImage("res/apes/monkey2.png");
        this.Main.box2D.addChild(this.target);
        this.target.pivot(55, 72);
        this.target.pos(100, 100);
    }
    createTimerLine() {
        this.timeLine.addLabel("turnRight", 0).to(this.target, { x: 450, y: 100, scaleX: 0.5, scaleY: 0.5 }, 2000, null, 0)
            .addLabel("turnDown", 0).to(this.target, { x: 450, y: 300, scaleX: 0.2, scaleY: 1, alpha: 1 }, 2000, null, 0)
            .addLabel("turnLeft", 0).to(this.target, { x: 100, y: 300, scaleX: 1, scaleY: 0.2, alpha: 0.1 }, 2000, null, 0)
            .addLabel("turnUp", 0).to(this.target, { x: 100, y: 100, scaleX: 1, scaleY: 1, alpha: 1 }, 2000, null, 0);
        this.timeLine.play(0, true);
        this.timeLine.on(Event.COMPLETE, this, this.onComplete);
        this.timeLine.on(Event.LABEL, this, this.onLabel);
    }
    onComplete() {
        console.log("timeLine complete!!!!");
    }
    onLabel(label) {
        console.log("LabelName:" + label);
    }
    keyDown(e) {
        switch (e.keyCode) {
            case Keyboard.LEFT:
                this.timeLine.play("turnLeft");
                break;
            case Keyboard.RIGHT:
                this.timeLine.play("turnRight");
                break;
            case Keyboard.UP:
                this.timeLine.play("turnUp");
                break;
            case Keyboard.DOWN:
                this.timeLine.play("turnDown");
                break;
            case Keyboard.P:
                this.timeLine.pause();
                break;
            case Keyboard.R:
                this.timeLine.resume();
                break;
        }
    }
    dispose() {
        Laya.stage.off(Event.KEY_DOWN, this, this.keyDown);
    }
}
