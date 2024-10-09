import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'green','yellow',2);
    sp.pos(100,100);
    sp.frameLoop(1,sp,()=>{
        sp.x++;
    })
    Laya.stage.addChild(sp);

}


test();