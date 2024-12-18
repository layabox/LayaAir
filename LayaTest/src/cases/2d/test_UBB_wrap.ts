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
    sp.width=172;
    sp.height=96;
    sp.ubb=true;
    sp.fontSize=20;
    sp.wordWrap=true;
    sp.color='white'
    sp.text ='shaderValue.[url]clipMatDir[/url] letclipInfo = this._clipMatrix'
    sp.pos(100,10)
    Laya.stage.addChild(sp);

    {
        let sp = new Text()
        sp.pos(100,200)
        sp.width=272;
        sp.height=96;
        sp.ubb=true;
        sp.fontSize=20;
        sp.wordWrap=true;
        sp.color='white'
        sp.text ='shaderValue.[url]clipMatDir[/url];[url]letclipInfo[/url] =[url] this._clipMatrix[/url]'
        Laya.stage.addChild(sp);
    }

    

}


test();