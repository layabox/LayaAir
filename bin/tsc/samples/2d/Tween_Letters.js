import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Ease } from "laya/utils/Ease";
import { Tween } from "laya/utils/Tween";
import { WebGL } from "laya/webgl/WebGL";
export class Tween_Letters {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        //
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //
        //			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        var w = 400;
        var offset = Laya.stage.width - w >> 1;
        var endY = Laya.stage.height / 2 - 50;
        var demoString = "LayaBox";
        for (var i = 0, len = demoString.length; i < len; ++i) {
            var letterText = this.createLetter(demoString.charAt(i));
            letterText.x = w / len * i + offset;
            Tween.to(letterText, { y: endY }, 1000, Ease.elasticOut, null, i * 1000);
        }
    }
    createLetter(char) {
        var letter = new Text();
        letter.text = char;
        letter.color = "#FFFFFF";
        letter.font = "Impact";
        letter.fontSize = 110;
        this.Main.box2D.addChild(letter);
        return letter;
    }
}
