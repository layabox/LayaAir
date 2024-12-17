import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";


/**
 * ubb wrap
 * 改变大小会有下划线的残留
 */
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Text()
    sp.pos(100,200)
    sp.width=358;
    sp.height=96;
    sp.ubb=true;
    sp.fontSize=20;
    sp.wordWrap=true;
    sp.color='white'
    sp.text ='shaderValue.[url]clipMatDir[/url];[url]letclipInfo[/url]'
    Laya.stage.addChild(sp);
    
    setTimeout(() => {
        sp.width=250;
    }, 2000);

}


test();