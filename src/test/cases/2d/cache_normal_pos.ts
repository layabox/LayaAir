import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { TextRender } from "laya/webgl/text/TextRender";

/**
 * 设置cachenormal之后，移动位置不会重构cache信息
 */
let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    //sp.graphics.drawTexture(tex,100,300,null,null,null);
    Laya.stage.addChild(sp);

    let curx=0;
    let cury=200;
    let sp1 = new Sprite();
    sp1.graphics.drawTexture(tex,0,0,100,100,null);
    sp1.pos(curx,cury);
    sp1.cacheAs='normal'
    Laya.stage.addChild(sp1);
    let sp2 = new Sprite();
    sp2.graphics.drawPoly(0,0,[0,0,100,0,100,100],'red','black')
    sp2.pos(20,20);
    sp1.addChild(sp2);


    function renderloop(){
        sp1.pos(curx,cury);
        curx+=1;
        if(curx>600)curx=0;
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();