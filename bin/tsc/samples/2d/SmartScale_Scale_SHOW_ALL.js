import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
export class SmartScale_Scale_SHOW_ALL {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        Laya.init(550, 400);
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.createCantralRect();
    }
    createCantralRect() {
        this.rect = new Sprite();
        this.rect.graphics.drawRect(-100, -100, 200, 200, "gray");
        this.Main.box2D.addChild(this.rect);
        this.updateRectPos();
    }
    updateRectPos() {
        this.rect.x = Laya.stage.width / 2;
        this.rect.y = Laya.stage.height / 2;
    }
}
