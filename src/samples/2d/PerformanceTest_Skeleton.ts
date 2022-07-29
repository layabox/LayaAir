import { Laya } from "Laya";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "./../Main";

export class PerformanceTest_Skeleton {
    private mArmature: Skeleton;
    private fileName: string = "Dragon";

    private rowCount: number = 10;
    private colCount: number = 10;
    private xOff: number = 50;
    private yOff: number = 100;
    private mSpacingX: number;
    private mSpacingY: number;

    private mAnimationArray: any[] = [];


    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;
        this.mSpacingX = Browser.width / this.colCount;
        this.mSpacingY = Browser.height / this.rowCount;

        Laya.init(Browser.width, Browser.height, WebGL);
        Stat.show();

        Laya.loader.load("res/skeleton/" + this.fileName + "/" + this.fileName + ".sk", { mainTexture: true }).then((templet: Templet) => {
            for (var i: number = 0; i < this.rowCount; i++) {
                for (var j: number = 0; j < this.colCount; j++) {
                    this.mArmature = templet.buildArmature(1);
                    this.mArmature.x = this.xOff + j * this.mSpacingX;
                    this.mArmature.y = this.yOff + i * this.mSpacingY;
                    this.mAnimationArray.push(this.mArmature);
                    this.mArmature.play(0, true);
                    this.Main.box2D.addChild(this.mArmature);
                }
            }
            Laya.stage.on(Event.CLICK, this, this.toggleAction);
        });
    }

    dispose(): void {
        Laya.stage.off(Event.CLICK, this, this.toggleAction);
    }

    private mActionIndex: number = 0;

    toggleAction(e: any = null): void {
        this.mActionIndex++;
        var tAnimNum: number = this.mArmature.getAnimNum();
        if (this.mActionIndex >= tAnimNum) {
            this.mActionIndex = 0;
        }
        for (var i: number = 0, n: number = this.mAnimationArray.length; i < n; i++) {
            this.mAnimationArray[i].play(this.mActionIndex, true);
        }
    }
}

