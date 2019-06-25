import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
export class Sprite_RoateAndScale {
    constructor(maincls) {
        this.scaleDelta = 0;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.createApe();
    }
    createApe() {
        this.ape = new Sprite();
        this.ape.loadImage("res/apes/monkey2.png");
        this.Main.box2D.addChild(this.ape);
        this.ape.pivot(55, 72);
        this.ape.x = Laya.stage.width / 2;
        this.ape.y = Laya.stage.height / 2;
        Laya.timer.frameLoop(1, this, this.animate);
    }
    animate(e = null) {
        this.ape.rotation += 2;
        //心跳缩放
        this.scaleDelta += 0.02;
        var scaleValue = Math.sin(this.scaleDelta);
        this.ape.scale(scaleValue, scaleValue);
    }
    dispose() {
        Laya.timer.clear(this, this.animate);
    }
}
