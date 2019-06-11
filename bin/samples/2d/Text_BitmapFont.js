import { Laya } from "Laya";
import { BitmapFont } from "laya/display/BitmapFont";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Text_BitmapFont {
    constructor(maincls) {
        this.fontName = "diyFont";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        this.loadFont();
    }
    loadFont() {
        var bitmapFont = new BitmapFont();
        bitmapFont.loadFont("res/bitmapFont/test.fnt", new Handler(this, this.onFontLoaded, [bitmapFont]));
    }
    onFontLoaded(bitmapFont) {
        bitmapFont.setSpaceWidth(10);
        Text.registerBitmapFont(this.fontName, bitmapFont);
        this.createText(this.fontName);
    }
    createText(font) {
        var txt = new Text();
        txt.width = 250;
        txt.wordWrap = true;
        txt.text = "Do one thing at a time, and do well.";
        txt.font = font;
        txt.leading = 5;
        txt.pos(Laya.stage.width - txt.width >> 1, Laya.stage.height - txt.height >> 1);
        this.Main.box2D.addChild(txt);
    }
}
