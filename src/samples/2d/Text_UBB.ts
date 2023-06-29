import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Main } from "../Main";
import { Text } from "laya/display/Text";

export class Text_UBB {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.setup();
        });
    }

    private setup(): void {
        this.createParagraph();	// 代码创建
    }
    private createParagraph(): void {
        var t = new Text();
        t.ubb = true;
        t.fontSize = 50;
        t.zOrder = 90000;
        t.text = '[color=#e3d26a]使用[/color]<br/>';
        t.text += '[color=#0bbd71]U[/color][color=#ff133c][u]B[/u][color][color=#409ed7][b]B[/b][/color]<br/>';
        t.text += '[color=#6ad2e3]创建的[/color]<br/>';
        t.text += '[color=#d26ae3]UBB文本[/color]<br/>';
        this.Main.box2D.addChild(t);
    }
}

