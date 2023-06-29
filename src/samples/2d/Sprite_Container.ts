import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Sprite_Container {
    // 该容器用于装载4张猩猩图片
    private apesCtn: Sprite;
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.createApes();
        });

    }

    private createApes(): void {
        // 每只猩猩距离中心点150像素
        var layoutRadius: number = 150;
        var radianUnit: number = Math.PI / 2;

        this.apesCtn = new Sprite();
        this.Main.box2D.addChild(this.apesCtn);

        // 添加4张猩猩图片
        for (var i: number = 0; i < 4; i++) {
            var ape: Sprite = new Sprite();
            ape.loadImage("res/apes/monkey" + i + ".png");

            ape.pivot(55, 72);

            // 以圆周排列猩猩
            ape.pos(
                Math.cos(radianUnit * i) * layoutRadius,
                Math.sin(radianUnit * i) * layoutRadius);

            this.apesCtn.addChild(ape);
        }

        this.apesCtn.pos(Laya.stage.width / 2, Laya.stage.height / 2);

        Laya.timer.frameLoop(1, this, this.animate);
    }

    private animate(e: Event = null): void {
        this.apesCtn.rotation += 1;
    }

    dispose(): void {
        Laya.timer.clear(this, this.animate);
    }
}

