import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Stage } from "../../../layaAir/laya/display/Stage";

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Sprite();
    sp.name='root';
    sp.graphics.drawRect(0,0,100,100,'red','green',1);
    sp.pos(100,100);
    sp.rotation=45;

    let sp1 = new Sprite();
    sp1.name='child';
    sp1.graphics.drawRect(0,0,100,10,'blue');
    sp1.pos(50,0);


    let sp2 = new Sprite();
    sp2.name='childchild';
    sp2.graphics.drawRect(0,0,100,10,'yellow');
    sp2.pos(50,10);

    Laya.stage.addChild(sp).addChild(sp1).addChild(sp2);
}


test();