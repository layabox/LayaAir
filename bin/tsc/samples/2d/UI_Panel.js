import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Image } from "laya/ui/Image";
import { Panel } from "laya/ui/Panel";
/**
 * ...
 * @author suvivor
 */
export class UI_Panel {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        Laya.init(800, 600);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        var panel = new Panel();
        panel.hScrollBarSkin = "res/ui/hscroll.png";
        panel.hScrollBar.hide = true;
        panel.size(600, 275);
        panel.x = (Laya.stage.width - panel.width) / 2;
        panel.y = (Laya.stage.height - panel.height) / 2;
        this.Main.box2D.addChild(panel);
        var img;
        for (var i = 0; i < 4; i++) {
            img = new Image("res/ui/dialog (1).png");
            img.x = i * 250;
            panel.addChild(img);
        }
    }
}
