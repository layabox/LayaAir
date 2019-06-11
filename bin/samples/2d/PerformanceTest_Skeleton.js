import { Laya } from "Laya";
import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
export class PerformanceTest_Skeleton {
    constructor(maincls) {
        this.fileName = "Dragon";
        this.rowCount = 10;
        this.colCount = 10;
        this.xOff = 50;
        this.yOff = 100;
        this.mAnimationArray = [];
        this.Main = null;
        this.mActionIndex = 0;
        this.Main = maincls;
        this.mSpacingX = Browser.width / this.colCount;
        this.mSpacingY = Browser.height / this.rowCount;
        Laya.init(Browser.width, Browser.height, WebGL);
        Stat.show();
        this.mTexturePath = "res/skeleton/" + this.fileName + "/" + this.fileName + ".png";
        this.mAniPath = "res/skeleton/" + this.fileName + "/" + this.fileName + ".sk";
        Laya.loader.load([{ url: this.mTexturePath, type: Loader.IMAGE }, { url: this.mAniPath, type: Loader.BUFFER }], Handler.create(this, this.onAssetsLoaded));
    }
    onAssetsLoaded(e = null) {
        var tTexture = Loader.getRes(this.mTexturePath);
        var arraybuffer = Loader.getRes(this.mAniPath);
        this.mFactory = new Templet();
        this.mFactory.on(Event.COMPLETE, this, this.parseComplete);
        this.mFactory.parseData(tTexture, arraybuffer, 10);
    }
    parseComplete(e = null) {
        for (var i = 0; i < this.rowCount; i++) {
            for (var j = 0; j < this.colCount; j++) {
                this.mArmature = this.mFactory.buildArmature(1);
                this.mArmature.x = this.xOff + j * this.mSpacingX;
                this.mArmature.y = this.yOff + i * this.mSpacingY;
                this.mAnimationArray.push(this.mArmature);
                this.mArmature.play(0, true);
                this.Main.box2D.addChild(this.mArmature);
            }
        }
        Laya.stage.on(Event.CLICK, this, this.toggleAction);
    }
    dispose() {
        if (this.mFactory) {
            this.mFactory.destroy();
        }
        Laya.stage.off(Event.CLICK, this, this.toggleAction);
    }
    toggleAction(e = null) {
        this.mActionIndex++;
        var tAnimNum = this.mArmature.getAnimNum();
        if (this.mActionIndex >= tAnimNum) {
            this.mActionIndex = 0;
        }
        for (var i = 0, n = this.mAnimationArray.length; i < n; i++) {
            this.mAnimationArray[i].play(this.mActionIndex, true);
        }
    }
}
