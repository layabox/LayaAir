import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Timer } from "laya/utils/Timer";
import { TextRender } from "laya/webgl/text/TextRender";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(1280,720);
    Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Text()
    sp.padding = [2, 0, 2, 0]
    //sp.font = "Montserrat";
    sp.fontSize = 26;
    sp.pos(110, 440);
    sp.size(1020, 108)
    sp.overflow = Text.HIDDEN;
    sp.wordWrap = true;
    sp.color = "#FFFFFF";
    sp.ubb = true;
    sp.pos(100,100)
    TextRender.textRenderInst.charRender.canvasWidth=1298;

    setTimeout(() => {
        sp.text="虽然心里觉得云子衿应该是买不起的，但是秉承着顾客是上帝的原则，小玫还是服务的很周到。";
    }, 100);

    Laya.stage.addChild(sp);
}


test();