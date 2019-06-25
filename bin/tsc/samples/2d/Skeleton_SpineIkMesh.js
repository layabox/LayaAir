import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { Stat } from "laya/utils/Stat";
export class Skeleton_SpineIkMesh {
    constructor(maincls) {
        this.mStartX = 180;
        this.mStartY = 340;
        this.mActionIndex = 0;
        this.mCurrIndex = 0;
        this.mCurrSkinIndex = 0;
        this.Main = null;
        this.Main = maincls;
        //			WebGL.enable();
        //			Laya.init(Browser.width, Browser.height);
        //			Laya.stage.bgColor = "#ffffff";
        Stat.show();
        this.startFun();
    }
    startFun() {
        this.mAniPath = "res/spine/spineRes3/raptor.sk";
        this.mFactory = new Templet();
        this.mFactory.on(Event.COMPLETE, this, this.parseComplete);
        this.mFactory.on(Event.ERROR, this, this.onError);
        this.mFactory.loadAni(this.mAniPath);
    }
    onError(e) {
        console.log("error");
    }
    parseComplete(fac) {
        //创建模式为1，可以启用换装
        this.mArmature = this.mFactory.buildArmature(1);
        this.mArmature.x = this.mStartX;
        this.mArmature.y = this.mStartY;
        this.mArmature.scale(0.3, 0.3);
        this.Main.box2D.addChild(this.mArmature);
        this.mArmature.on(Event.STOPPED, this, this.completeHandler);
        this.play();
    }
    completeHandler() {
        this.play();
    }
    play() {
        this.mCurrIndex++;
        if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
            this.mCurrIndex = 0;
        }
        this.mArmature.play(this.mCurrIndex, false);
    }
    dispose() {
        if (this.mArmature == null)
            return;
        this.mArmature.stop();
        this.mArmature.off(Event.STOPPED, this, this.completeHandler);
    }
}
