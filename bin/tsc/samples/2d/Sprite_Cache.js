import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
export class Sprite_Cache {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(800, 600, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Stat.show();
        this.setup();
    }
    setup() {
        var textBox = new Sprite();
        // 随机摆放文本
        var text;
        for (var i = 0; i < 1000; i++) {
            text = new Text();
            text.fontSize = 20;
            text.text = (Math.random() * 100).toFixed(0);
            text.rotation = Math.random() * 360;
            text.color = "#CCCCCC";
            text.x = Math.random() * Laya.stage.width;
            text.y = Math.random() * Laya.stage.height;
            textBox.addChild(text);
        }
        //缓存为静态图像
        //			textBox.cacheAsBitmap = true;
        this.Main.box2D.addChild(textBox);
    }
}
