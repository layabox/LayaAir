import "laya/ModuleDef";

import { Laya } from "../../../Laya";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Sprite();
    sp.graphics.drawPie(20,20,15,0,45,'red','green',0)
    //sp.cacheAs='bitmap'
    sp.scale(4,4);
    sp.pos(100,100)

    Laya.stage.addChild(sp);

    let end = 0;
    function renderloop(){
        sp.graphics.clear();
        sp.graphics.drawPie(20,20,15,0,-end,'red','green',0);
        end++;
        if(end>360)end=0;

        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();