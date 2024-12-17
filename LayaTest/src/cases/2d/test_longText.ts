import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Text()
    sp.color='white'
    sp.text ='口口口口口口口1口口口口口口口口口口2口口口口口口口口口口3口口口口口口口口口口4口口口口口口口口口口5口口口口口口口口口口6口口口口口口口口口口7口口口口口口口口口口8口口口口口口口口口口9'
    sp.pos(100,100)

    Laya.stage.addChild(sp);

}


test();