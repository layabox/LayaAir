import { Laya } from "Laya";
import { Templet } from "laya/ani/bone/Templet";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Event } from "laya/events/Event";
import { getResPath } from "./resPath";


export class Main{
    tmp:Templet;
    ske:Skeleton;
    index=0;
    constructor(){
        this.init();
    }
    init(){
        Laya.init(1024,800);
        this.tmp = new Templet();
        this.tmp.on(Event.COMPLETE, this,this.aniLoaded);
        this.tmp.loadAni(getResPath('bone/ld.sk'));
    }

    aniLoaded(){
        var ske = this.ske = this.tmp.buildArmature(1);
        Laya.stage.addChild( ske );
        ske.pos(400,400);
        ske.scale(0.4,0.4);
        ske.on(Event.STOPPED,this,this.play);
        this.play();
    }

    play(){
        if(this.index>=this.ske.getAnimNum()){
            this.index=0;
        }
        this.ske.play(2,false);
        //this.index++;
    }

}