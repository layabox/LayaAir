import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { TextArea } from "laya/ui/TextArea";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_TextArea {
    constructor(maincls) {
        this.skin = "res/ui/textarea.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(550, 400, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.skin, Handler.create(this, this.onLoadComplete));
    }
    onLoadComplete(e = null) {
        var ta = new TextArea("");
        ta.skin = this.skin;
        ta.font = "Arial";
        ta.fontSize = 18;
        ta.bold = true;
        ta.color = "#3d3d3d";
        ta.pos(100, 15);
        ta.size(375, 355);
        ta.padding = "70,8,8,8";
        var scaleFactor = Browser.pixelRatio;
        this.Main.box2D.addChild(ta);
    }
}
