import "laya/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/ui/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Text } from "../../../layaAir/laya/display/Text";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
//在调用cacheas normal的渲染之前，先把前面的渲染出来
let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'red');
    sp.pos(100,100)
    Laya.stage.addChild(sp);

    let sp1 = new Sprite();
    sp1.graphics.drawRect(0,0,100,100,'green');
    sp1.pos(120,120);
    Laya.stage.addChild(sp1)
    sp1.cacheAs='normal';

    let desc = new Text();
    desc.text=`应该是红色的在底层`
    desc.color='green'
    desc.fontSize=32;
    desc.pos(100,300);
    Laya.stage.addChild(desc);    
}


test();