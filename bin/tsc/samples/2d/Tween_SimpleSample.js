import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Tween } from "laya/utils/Tween";
import { WebGL } from "laya/webgl/WebGL";
export class Tween_SimpleSample {
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
        var terminalX = 200;
        var characterA = this.createCharacter("res/cartoonCharacters/1.png");
        characterA.pivot(46.5, 50);
        characterA.y = 100;
        var characterB = this.createCharacter("res/cartoonCharacters/2.png");
        characterB.pivot(34, 50);
        characterB.y = 250;
        this.Main.box2D.graphics.drawLine(terminalX, 0, terminalX, Laya.stage.height, "#FFFFFF");
        // characterA使用Tween.to缓动
        Tween.to(characterA, { x: terminalX }, 1000);
        // characterB使用Tween.from缓动
        characterB.x = terminalX;
        Tween.from(characterB, { x: 0 }, 1000);
    }
    createCharacter(skin) {
        var character = new Sprite();
        character.loadImage(skin);
        this.Main.box2D.addChild(character);
        return character;
    }
    dispose() {
        this.Main.box2D.graphics.clear();
    }
}
