import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    sp.graphics.save();
    sp.graphics.clipRect(150,150,100,100);
    sp.graphics.drawTexture(tex,120,120,null,null,null);
    sp.graphics.drawTexture(tex,130,130,null,null,null);
    sp.graphics.drawTexture(tex,140,140,null,null,null);
    sp.graphics.restore();
    sp.graphics.drawRect(150,150,100,100,null,'red',3)
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();