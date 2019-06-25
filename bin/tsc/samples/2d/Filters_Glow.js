import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { GlowFilter } from "laya/filters/GlowFilter";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Filters_Glow {
    constructor(maincls) {
        this.apePath = "res/apes/monkey2.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        //			Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.apePath, Handler.create(this, this.setup));
    }
    setup(tex) {
        this.createApe();
        this.applayFilter();
    }
    createApe() {
        this.ape = new Sprite();
        this.ape.loadImage(this.apePath);
        var texture = Laya.loader.getRes(this.apePath);
        this.ape.x = (Laya.stage.width - texture.width) / 2;
        this.ape.y = (Laya.stage.height - texture.height) / 2;
        this.Main.box2D.addChild(this.ape);
    }
    applayFilter() {
        //创建一个发光滤镜
        var glowFilter = new GlowFilter("#ffff00", 10, 0, 0);
        //设置滤镜集合为发光滤镜
        this.ape.filters = [glowFilter];
    }
}
