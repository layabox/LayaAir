import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { ColorFilter } from "laya/filters/ColorFilter";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Filters_Color {
    constructor(maincls) {
        this.ApePath = "res/apes/monkey2.png";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.ApePath, Handler.create(this, this.setup));
    }
    setup(e = null) {
        this.normalizeApe();
        this.makeRedApe();
        this.grayingApe();
    }
    normalizeApe() {
        var originalApe = this.createApe();
        this.apeTexture = Laya.loader.getRes(this.ApePath);
        originalApe.x = (Laya.stage.width - this.apeTexture.width * 3) / 2;
        originalApe.y = (Laya.stage.height - this.apeTexture.height) / 2;
    }
    makeRedApe() {
        //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，红色
        var redMat = [1, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
            0, 0, 0, 1, 0];
        //创建一个颜色滤镜对象,红色
        var redFilter = new ColorFilter(redMat);
        // 赤化猩猩
        var redApe = this.createApe();
        redApe.filters = [redFilter];
        var firstChild = this.Main.box2D.getChildAt(0);
        redApe.x = firstChild.x + this.apeTexture.width;
        redApe.y = firstChild.y;
    }
    grayingApe() {
        //由 20 个项目（排列成 4 x 5 矩阵）组成的数组，灰图
        var grayscaleMat = [0.3086, 0.6094, 0.0820, 0, 0,
            0.3086, 0.6094, 0.0820, 0, 0,
            0.3086, 0.6094, 0.0820, 0, 0,
            0, 0, 0, 1, 0];
        //创建一个颜色滤镜对象，灰图
        var grayscaleFilter = new ColorFilter(grayscaleMat);
        // 灰度猩猩
        var grayApe = this.createApe();
        grayApe.filters = [grayscaleFilter];
        var secondChild = this.Main.box2D.getChildAt(1);
        grayApe.x = secondChild.x + this.apeTexture.width;
        grayApe.y = secondChild.y;
    }
    createApe() {
        var ape = new Sprite();
        ape.loadImage("res/apes/monkey2.png");
        this.Main.box2D.addChild(ape);
        return ape;
    }
}
