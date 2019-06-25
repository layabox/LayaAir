import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
/**
 * ...
 * @author suvivor
 */
export class HitTest_Rectangular {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        Laya.init(800, 600);
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.rect1 = this.createRect(100, "orange");
        this.rect2 = this.createRect(200, "purple");
        Laya.timer.frameLoop(1, this, this.loop);
    }
    createRect(size, color) {
        var rect = new Sprite();
        rect.graphics.drawRect(0, 0, size, size, color);
        rect.size(size, size);
        this.Main.box2D.addChild(rect);
        rect.on(Event.MOUSE_DOWN, this, this.startDrag, [rect]);
        rect.on(Event.MOUSE_UP, this, this.stopDrag, [rect]);
        return rect;
    }
    startDrag(target) {
        target.startDrag();
    }
    stopDrag(target) {
        target.stopDrag();
    }
    loop() {
        var bounds1 = this.rect1.getBounds();
        var bounds2 = this.rect2.getBounds();
        var hit = bounds1.intersects(bounds2);
        this.rect1.alpha = this.rect2.alpha = hit ? 0.5 : 1;
    }
}
