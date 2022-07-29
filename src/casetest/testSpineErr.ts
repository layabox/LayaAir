import { Laya } from "Laya";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Event } from "laya/events/Event";
import { getResPath } from "./resPath";


export class Main {
    ske: Skeleton;
    index = 0;
    constructor() {
        this.init();
    }
    init() {
        Laya.init(1024, 800);
        Laya.loader.load(getResPath('bone/ld.sk')).then(templet => {
            var ske = this.ske = templet.buildArmature(1);
            Laya.stage.addChild(ske);
            ske.pos(400, 400);
            ske.scale(0.4, 0.4);
            ske.on(Event.STOPPED, this, this.play);
            this.play();
        });
    }

    play() {
        if (this.index >= this.ske.getAnimNum()) {
            this.index = 0;
        }
        this.ske.play(2, false);
        //this.index++;
    }

}