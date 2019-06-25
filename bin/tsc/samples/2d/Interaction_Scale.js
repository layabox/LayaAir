import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
export class Interaction_Scale {
    constructor(maincls) {
        //上次记录的两个触模点之间距离
        this.lastDistance = 0;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.createSprite();
        Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Event.MOUSE_OUT, this, this.onMouseUp);
    }
    createSprite() {
        this.sp = new Sprite();
        var w = 300, h = 300;
        this.sp.graphics.drawRect(0, 0, w, h, "#FF7F50");
        this.sp.size(w, h);
        this.sp.pivot(w / 2, h / 2);
        this.sp.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.Main.box2D.addChild(this.sp);
        this.sp.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    onMouseDown(e = null) {
        var touches = e.touches;
        if (touches && touches.length == 2) {
            this.lastDistance = this.getDistance(touches);
            Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        }
    }
    onMouseMove(e = null) {
        var distance = this.getDistance(e.touches);
        //判断当前距离与上次距离变化，确定是放大还是缩小
        const factor = 0.01;
        this.sp.scaleX += (distance - this.lastDistance) * factor;
        this.sp.scaleY += (distance - this.lastDistance) * factor;
        this.lastDistance = distance;
    }
    onMouseUp(e = null) {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
    }
    /**计算两个触摸点之间的距离*/
    getDistance(points) {
        var distance = 0;
        if (points && points.length == 2) {
            var dx = points[0].stageX - points[1].stageX;
            var dy = points[0].stageY - points[1].stageY;
            distance = Math.sqrt(dx * dx + dy * dy);
        }
        return distance;
    }
    dispose() {
        if (this.sp) {
            this.sp.off(Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.onMouseUp);
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
    }
}
