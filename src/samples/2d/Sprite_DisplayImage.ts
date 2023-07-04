import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Sprite_DisplayImage {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.showApe();
        });

    }

    private showApe(): void {
        // 方法1：使用loadImage
        var ape: Sprite = new Sprite();
        this.Main.box2D.addChild(ape);
        ape.loadImage("res/apes/monkey3.png");

        // 方法2：使用drawTexture
        Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
            var t: Texture = Laya.loader.getRes("res/apes/monkey2.png");
            var ape: Sprite = new Sprite();
            ape.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape);
            ape.pos(200, 0);
        });
    }
}

