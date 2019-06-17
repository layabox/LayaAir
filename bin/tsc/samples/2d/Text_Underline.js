import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
export class Text_Underline {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(600, 400);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.createTexts();
    }
    createTexts() {
        this.createText('left', 1, null, 100, 10);
        this.createText('center', 2, "#00BFFF", 155, 150);
        this.createText('right', 3, "#FF7F50", 210, 290);
    }
    createText(align, underlineWidth, underlineColor, x, y) {
        var txt = new Text();
        txt.text = "Layabox\n是HTML5引擎技术提供商\n与优秀的游戏发行商\n面向AS/JS/TS开发者提供HTML5开发技术方案";
        txt.size(300, 50);
        txt.fontSize = 20;
        txt.color = "#ffffff";
        txt.align = align;
        // 设置下划线
        txt.underline = true;
        txt.underlineColor = underlineColor;
        txt.pos(x, y);
        this.Main.box2D.addChild(txt);
        return txt;
    }
}
