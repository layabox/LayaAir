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
    sp.graphics.clipRect(0,0,50,50);
    sp.graphics.drawRect(0,0,200,200,'gray','yellow',2)
    //sp.graphics.drawTexture(tex,100,100,null,null,null);
    //sp.graphics.drawTexture(tex,100,300,null,null,null);
    sp.pos(100,100)

    //建立一个sprite，每张贴图的字都用一个，然后想法gc，应该渲染正确
    let sp1 = new Sprite();
    sp1.graphics.drawRect(0,0,100,100,'green');
    sp1.pos(10,10);
    sp1.cacheAs='normal';

    let sp2 = new Sprite();
    sp2.graphics.drawRect(0,0,50,50,'red');
    sp2.pos(10,10);

    Laya.stage.addChild(sp).addChild(sp1).addChild(sp2);

    let frm=0;
    let startmove=false;
    let stx = 10;
    function renderloop(){
        frm++;
        if(frm==100){
            sp.graphics.clear();
            sp.graphics.clipRect(0,0,150,150);
            sp.graphics.drawRect(0,0,200,200,'gray','yellow',2)
            startmove=true;
        }
        if(startmove){
            //sp1.pos(stx--,10);
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();