import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
export class Sprite_Container {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //            Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        //            Laya.stage.alignH = Stage.ALIGN_CENTER;
        //            Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.createApes();
    }
    createApes() {
        // 每只猩猩距离中心点150像素
        var layoutRadius = 150;
        var radianUnit = Math.PI / 2;
        this.apesCtn = new Sprite();
        this.Main.box2D.addChild(this.apesCtn);
        // 添加4张猩猩图片
        for (var i = 0; i < 4; i++) {
            var ape = new Sprite();
            ape.loadImage("res/apes/monkey" + i + ".png");
            ape.pivot(55, 72);
            // 以圆周排列猩猩
            ape.pos(Math.cos(radianUnit * i) * layoutRadius, Math.sin(radianUnit * i) * layoutRadius);
            this.apesCtn.addChild(ape);
        }
        this.apesCtn.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        Laya.timer.frameLoop(1, this, this.animate);
    }
    animate(e = null) {
        this.apesCtn.rotation += 1;
    }
    dispose() {
        Laya.timer.clear(this, this.animate);
    }
}
