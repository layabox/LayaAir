import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
export class PerformanceTest_Cartoon {
    constructor(maincls) {
        this.colAmount = 100;
        this.extraSpace = 50;
        this.moveSpeed = 2;
        this.rotateSpeed = 2;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        // Laya.init(Browser.width, Browser.height, WebGL);
        Laya.stage.bgColor = "#232628";
        Stat.show();
        Laya.loader.load("res/cartoonCharacters/cartoonCharactors.json", Handler.create(this, this.createCharacters), null, Loader.ATLAS);
    }
    createCharacters(e = null) {
        this.characterGroup = [];
        for (var i = 0; i < this.colAmount; ++i) {
            var tx = (Laya.stage.width + this.extraSpace * 2) / this.colAmount * i - this.extraSpace;
            var tr = 360 / this.colAmount * i;
            var startY = (Laya.stage.height - 500) / 2;
            this.createCharacter("cartoonCharactors/1.png", 46, 50, tr).pos(tx, 50 + startY);
            this.createCharacter("cartoonCharactors/2.png", 34, 50, tr).pos(tx, 150 + startY);
            this.createCharacter("cartoonCharactors/3.png", 42, 50, tr).pos(tx, 250 + startY);
            this.createCharacter("cartoonCharactors/4.png", 48, 50, tr).pos(tx, 350 + startY);
            this.createCharacter("cartoonCharactors/5.png", 36, 50, tr).pos(tx, 450 + startY);
        }
        Laya.timer.frameLoop(1, this, this.animate);
    }
    createCharacter(skin, pivotX, pivotY, rotation) {
        var charactor = new Sprite();
        charactor.loadImage(skin);
        charactor.rotation = rotation;
        charactor.pivot(pivotX, pivotY);
        this.Main.box2D.addChild(charactor);
        this.characterGroup.push(charactor);
        return charactor;
    }
    animate() {
        for (var i = this.characterGroup.length - 1; i >= 0; --i) {
            this.animateCharactor(this.characterGroup[i]);
        }
    }
    animateCharactor(charactor) {
        charactor.x += this.moveSpeed;
        charactor.rotation += this.rotateSpeed;
        if (charactor.x > Laya.stage.width + this.extraSpace) {
            charactor.x = -this.extraSpace;
        }
    }
    dispose() {
        Laya.timer.clear(this, this.animate);
    }
}
