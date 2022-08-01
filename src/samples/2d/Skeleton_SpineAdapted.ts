import { SpineSkeleton } from "laya/spine/SpineSkeleton";
import { Browser } from "laya/utils/Browser"
import { Event } from "laya/events/Event";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { SpineTemplet, SpineVersion } from "laya/spine/SpineTemplet";
import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";

export class Skeleton_SpineAdapted {

    private skeleton: SpineSkeleton;
    private index: number = -1;

    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.width, Browser.height);
        Laya.stage.bgColor = "#cccccc";
        Stat.show();

        Laya.loader.load("res/spine/alien-pma.json", Loader.SPINE).then((templet: SpineTemplet) => {
            this.skeleton = new SpineSkeleton();
            this.skeleton.templet = templet;
            this.Main.box2D.addChild(this.skeleton);
            this.skeleton.pos(Browser.width / 2, Browser.height / 2 + 100);
            this.skeleton.scale(0.5, 0.5);
            this.skeleton.on(Event.STOPPED, this, this.play);
            this.play();
        });
    }

    private play(): void {
        if (++this.index >= this.skeleton.getAnimNum()) {
            this.index = 0
        }
        this.skeleton.play(this.index, false, true)
    }
}


