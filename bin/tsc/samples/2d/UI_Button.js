import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class UI_Button {
    constructor(maincls) {
        this.COLUMNS = 2;
        this.BUTTON_WIDTH = 147;
        this.BUTTON_HEIGHT = 165 / 3;
        this.HORIZONTAL_SPACING = 200;
        this.VERTICAL_SPACING = 100;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.skins = ["res/ui/button-1.png", "res/ui/button-2.png", "res/ui/button-3.png",
            "res/ui/button-4.png", "res/ui/button-5.png", "res/ui/button-6.png"];
        // 计算将Button至于舞台中心的偏移量
        this.xOffset = (Laya.stage.width - this.HORIZONTAL_SPACING * (this.COLUMNS - 1) - this.BUTTON_WIDTH) / 2;
        this.yOffset = (Laya.stage.height - this.VERTICAL_SPACING * (this.skins.length / this.COLUMNS - 1) - this.BUTTON_HEIGHT) / 2;
        Laya.loader.load(this.skins, Handler.create(this, this.onUIAssetsLoaded));
    }
    onUIAssetsLoaded(e = null) {
        for (var i = 0, len = this.skins.length; i < len; ++i) {
            var btn = this.createButton(this.skins[i]);
            var x = i % this.COLUMNS * this.HORIZONTAL_SPACING + this.xOffset;
            var y = (i / this.COLUMNS | 0) * this.VERTICAL_SPACING + this.yOffset;
            btn.pos(x, y);
            console.log(x, y);
        }
    }
    createButton(skin) {
        var btn = new Button(skin);
        this.Main.box2D.addChild(btn);
        return btn;
    }
}
