import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
/**
 * ...
 * @author suvivor
 */
export class HitTest_Point {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        Laya.init(800, 600);
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        var size = 200;
        var color = "orange";
        this.rect = new Sprite();
        this.rect.graphics.drawRect(0, 0, size, size, color);
        this.rect.size(size, size);
        this.rect.x = (Laya.stage.width - this.rect.width) / 2;
        this.rect.y = (Laya.stage.height - this.rect.height) / 2;
        this.Main.box2D.addChild(this.rect);
        Laya.timer.frameLoop(1, this, this.loop);
    }
    loop() {
        var hit = this.rect.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY);
        this.rect.alpha = hit ? 0.5 : 1;
    }
}
