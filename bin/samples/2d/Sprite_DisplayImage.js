import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Sprite_DisplayImage {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        //			Laya.stage.alignH = Stage.ALIGN_CENTER;
        //
        //			Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.showApe();
    }
    showApe() {
        // 方法1：使用loadImage
        var ape = new Sprite();
        this.Main.box2D.addChild(ape);
        ape.loadImage("res/apes/monkey3.png");
        // 方法2：使用drawTexture
        Laya.loader.load("res/apes/monkey2.png", Handler.create(this, function () {
            var t = Laya.loader.getRes("res/apes/monkey2.png");
            var ape = new Sprite();
            ape.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape);
            ape.pos(200, 0);
        }));
    }
}
